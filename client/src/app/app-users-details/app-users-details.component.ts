import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, UserService, PackagesService, PackageBillingsService } from '../services';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { MatSnackBar } from '@angular/material';
import { BillingHistory } from '../models/models';
import { BillingDialogComponent } from '../billing-history/billing-history.component';

@Component({
  selector: 'app-app-users-details',
  templateUrl: './app-users-details.component.html',
  styleUrls: ['./app-users-details.component.css']
})
export class AppUsersDetailsComponent implements OnInit {
	public userDetails: any;
	public activeUserPackage: any;
	constructor(private auth: AuthService, private userService: UserService, private route: ActivatedRoute, public dialog: MatDialog, public snackBar: MatSnackBar) { }

	ngOnInit() {
		this.auth.getCookies().then(cookieData=>{
			this.route.params.subscribe(params => {
				if(parseInt(cookieData['idx'])===10 && params['userId'] !== undefined){
					this.getUserDetails(params['userId']);
				}
		    });
		});
	}

	getUserDetails(userId:String){
		this.userService.getAuthUserDetails([{userId:userId}])
			.subscribe(userDetailInfo=>{
				this.userDetails = userDetailInfo.userInfo;
				this.activeUserPackage = userDetailInfo.activePackage;
			}, error => {
				console.log(error);
			})
	}

	makeUserPayment(userId:String){
		if(userId!==undefined){
			let dialogOptions = {
	  			width: '600px',
	  			// position: 'center',
	  			disableClose: true,
	  			data: {
	  				userId: userId,
	  				selectedBillingUserEmail: this.userDetails.email
	  			}
			};

			let dialogRef = this.dialog.open(AdminBillingDialogComponent, dialogOptions);
			dialogRef.afterClosed().subscribe(result => {
				if(result.success == false){
					if(result.message){
						this.snackBar.open(result.message, '', {
							duration: 3000,
						});
					}else{
						this.snackBar.open('Error has been occured for the action.', '', {
								duration: 3000,
							});
					}
				}else{
	      			this.ngOnInit();
				}
	    	});
		}
	}

	openBillingModal(editData:BillingHistory=<BillingHistory>{}){
  		let dialogOptions = {
  			width: '600px',
  			// position: 'center',
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
      			this.ngOnInit();
			}
    	});
  	}

}


@Component({
	selector: 'admin-billing-dialog',
	templateUrl: './adminBilling.dialog.component.html',
})
export class AdminBillingDialogComponent implements OnInit {
	public userId;
	public selectedBillingUserEmail;
	public packages: any;
	public selectedPackage: any = {};

	constructor(
		public dialogRef: MatDialogRef<AdminBillingDialogComponent>, 
		@Inject(MAT_DIALOG_DATA) public data: any,
		private packagesService: PackagesService, 
		public PackageBillingsService: PackageBillingsService
	){
		if(data){
			if(data.userId){
				this.userId = data.userId;
				this.selectedBillingUserEmail = data.selectedBillingUserEmail;
			}
		}
	}

	ngOnInit() {
		this.getBillingOptions();
	}

	getBillingOptions(){
  		this.packagesService.getPayingPackages()
  			.subscribe(packages=>{
  				this.packages = packages;
  				this.selectedPackage = {
  					paymentMethod: 'manual',
  					index: 0,
  					name: packages[0]['name'],
  					duration: 'monthly',
  					cost: packages[0]['cost'],
  					days: packages[0]['days']
  				};
  			}, error=>{
  				console.log(error)
  			})
	}

	onPackageSelected(index){
		this.selectedPackage = {
			index: index,
			name: this.packages[index]['name'],
			duration: this.selectedPackage.duration,
			packagePayment: this.selectedPackage.packagePayment
		};
		if(this.selectedPackage['duration'] === 'annually'){
			this.selectedPackage['days'] = 365;
			this.selectedPackage['cost'] = this.packages[index]['annualCost']*12;
		}else{
			this.selectedPackage['days'] = this.packages[index]['days'];
			this.selectedPackage['cost'] = this.packages[index]['cost'];
		}
	}

	onChangeDuration(duration){
		let index = this.selectedPackage.index;
		this.selectedPackage = {
			index: index,
			name: this.packages[index]['name'],
			featureIds: this.packages[index]['featureIds'],
			duration: duration,
			packagePayment: this.selectedPackage.packagePayment
		};

		if(duration === 'annually'){
			this.selectedPackage['days'] = 365;
			this.selectedPackage['cost'] = this.packages[index]['annualCost']*12;
		}else{
			this.selectedPackage['days'] = this.packages[index]['days'];
			this.selectedPackage['cost'] = this.packages[index]['cost'];
		}

	}

	submitUserPayment(form){
		let data = {
			selectedBillingUser: this.userId,
			selectedBillingUserEmail: this.selectedBillingUserEmail,
			packages: this.selectedPackage
		};
		this.PackageBillingsService.submitPackage(data)
			.subscribe(submitResponse=>{
				this.dialogRef.close(submitResponse);
			}, submitErr=>{
				this.dialogRef.close(submitErr);
			});
	}
}