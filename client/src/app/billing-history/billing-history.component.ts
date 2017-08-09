import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PackageBillingsService, AuthService, PackagesService } from '../services';
import { MdDialog, MdDialogRef } from '@angular/material';
import { BillingHistory } from '../models/models';
import { IMyOptions, IMyDateModel } from 'mydatepicker';
import { MdSnackBar } from '@angular/material';

@Component({
  selector: 'app-billing-history',
  templateUrl: './billing-history.component.html',
  styleUrls: ['./billing-history.component.css']
})
export class BillingHistoryComponent implements OnInit {
	private userId: string;
	billings: any;
	billingError: any;
	private cookieIndex: number;
	constructor(private billingService: PackageBillingsService, private auth: AuthService, private route: ActivatedRoute, public dialog: MdDialog, public snackBar: MdSnackBar) {

	}
	
  	ngOnInit() {
  		this.auth.getCookies().then(cookieData=>{
			this.route.params.subscribe(params => {
				if(parseInt(cookieData['idx'])===10 && params['userId'] !== undefined){
					this.userId = params['userId'];
					this.cookieIndex = parseInt(cookieData['idx']);
					this.getUserBillingHistory();
				}else{
  					this.getBillingHistory();
				}
		    });
		});
 	}

  	getBillingHistory(){
		this.billingService.getUserBillings()
			.subscribe(billings=>{
				this.billings = billings;
			}, error=>{
				this.billingError = error;
			});
  	}

  	getUserBillingHistory(){
		this.billingService.queryUserBillings([{userId:this.userId}])
				.subscribe(billings=>{
					this.billings = billings;
				}, error=>{
					this.billingError = error;
				});
  	}

  	openBillingModal(editData:BillingHistory=<BillingHistory>{}){
  		let dialogOptions = {
  			width: '600px',
  			position: 'center',
  			disableClose: true
		};

		dialogOptions["data"] = {};
		if(JSON.stringify(editData) !== '{}'){
			dialogOptions["data"]["billingHistory"] = editData;
		}
		let dialogRef = this.dialog.open(BillingDialogComponent, dialogOptions);
		dialogRef.afterClosed().subscribe(result => {
			if(result.success == false){
				this.snackBar.open('Error has been occured for the action.', '', {
						duration: 3000,
					});
					setTimeout(()=>{ 
						location.reload();
					}, 3000);
			}else{
      			this.getUserBillingHistory();
			}
    	});
  	}

	upgradeBillPayment(index){
		let billingObj = JSON.parse(JSON.stringify(this.billings[index]));
		billingObj['userId'] = this.userId;
		if(billingObj['packagePayment'] == true){
			billingObj['packagePayment'] = false;
		}else{
			billingObj['packagePayment'] = true;
		}
		this.billingService.updateBillPayment(billingObj)
			.subscribe(billingHistory=>{
				this.getUserBillingHistory();
			}, error=>{
				this.snackBar.open('Failed to Toggle Field.', '', {
					duration: 3000,
				});
				setTimeout(()=>{ 
					location.reload();
				}, 3000);
			});
	}


	toggleBillingFlag(index, field){
		let billingObj = JSON.parse(JSON.stringify(this.billings[index]));
		billingObj['userId'] = this.userId;
		if(billingObj[field] == true){
			billingObj[field] = false;
		}else{
			billingObj[field] = true;
		}
		this.billingService.updateBillingDetails(billingObj)
			.subscribe(billingHistory=>{
				this.getUserBillingHistory();
			}, error=>{
				this.snackBar.open('Failed to Toggle Field.', '', {
					duration: 3000,
				});
				setTimeout(()=>{ 
					location.reload();
				}, 3000);
			});
	}
}

@Component({
	selector: 'billing-dialog',
	templateUrl: './billing-history-dialog.html',
})
export class BillingDialogComponent implements OnInit {
	billingHistory: BillingHistory = <BillingHistory>{};
	title: string = 'Add User Billings';
	packages: any;
	submittedBillingForm: boolean = false;
	submittedBillingFormOnProgress: boolean = false;

	public myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
        firstDayOfWeek: 'su',
        sunHighlight: false,
        editableDateField: false
    };

	constructor(private packagesService: PackagesService, public dialogRef: MdDialogRef<BillingHistoryComponent>, private billingService: PackageBillingsService){
		if(this.dialogRef._containerInstance.dialogConfig.data){
			if(this.dialogRef._containerInstance.dialogConfig.data.billingHistory){
				this.billingHistory = Object.assign({}, this.dialogRef._containerInstance.dialogConfig.data.billingHistory);
				let activatesOn = new Date(this.billingHistory['activatesOn']*1000);
				this.billingHistory['activatesOn'] = {
					date: {
						year: activatesOn.getFullYear(),
						month: activatesOn.getMonth()+1,
						day: activatesOn.getDate()
					}
				};
				let expiresOn = new Date(this.billingHistory['expiresOn']*1000);
				this.billingHistory['expiresOn'] = {
					date: {
						year: expiresOn.getFullYear(),
						month: expiresOn.getMonth()+1,
						day: expiresOn.getDate()
					}
				};
				this.title = 'Edit Billing Details';
			}
		}
	}

	ngOnInit(){
		this.packagesService.getAppPackage()
			.subscribe(packages=>{
				this.packages = packages;
			});
	}

	submitBillingDetails(bookingForm:any) {
		this.submittedBillingForm = true;
		if(bookingForm.valid){
			if(this.dialogRef._containerInstance.dialogConfig.data.billingHistory){
				this.updateBookingDetails();
			}
		}
	}

	updateBookingDetails() {
		this.submittedBillingFormOnProgress = true;
		this.billingService.updateBillingDetails(this.billingHistory)
			.subscribe(billingHistory=>{
				billingHistory.success = true;
				this.dialogRef.close(billingHistory);
			}, error=>{
				error.success = false;
				this.dialogRef.close(error);
			});
	}

}