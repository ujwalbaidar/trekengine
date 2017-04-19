import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PackageBillingsService, AuthService, PackagesService } from '../services';
import { MdDialog, MdDialogRef } from '@angular/material';
import { BillingHistory } from '../models/models';
import { IMyOptions, IMyDateModel } from 'mydatepicker';

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
	constructor(private billingService: PackageBillingsService, private auth: AuthService, private route: ActivatedRoute, public dialog: MdDialog) {

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
			height: '500px',
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
      		this.getUserBillingHistory();
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
				let activatedDate = new Date(this.billingHistory['activatesOn']*1000);
				this.billingHistory['activatedDate'] = {
					date: {
						year: activatedDate.getFullYear(),
						month: activatedDate.getMonth()+1,
						day: activatedDate.getDate()
					}
				};
				let expiryDate = new Date(this.billingHistory['expiresOn']*1000);
				this.billingHistory['expiryDate'] = {
					date: {
						year: activatedDate.getFullYear(),
						month: activatedDate.getMonth(),
						day: activatedDate.getDate()
					}
				};
				this.title = 'Edit Booking Details';
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
		if(bookingForm.valid){
			if(this.dialogRef._containerInstance.dialogConfig.data.billingHistory){
				this.updateBookingDetails();
			}
		}
	}

	updateBookingDetails() {
		this.billingService.updateBillingDetails(this.billingHistory)
			.subscribe(billingHistory=>{
				this.dialogRef.close(billingHistory);
			}, error=>{
				this.dialogRef.close(error);
			});
	}
}