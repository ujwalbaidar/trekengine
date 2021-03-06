import { Component, OnInit } from '@angular/core';
import { PackageBillingsService, AuthService, UserService } from '../services';
import { FeaturePackage } from '../models/models';
import { CookieService } from 'ngx-cookie';
import { MatDialog } from '@angular/material';
import { RegisterComponent, RegisterSuccessDialogComponent } from '../register/register.component';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-package-billings',
  templateUrl: './package-billings.component.html',
  styleUrls: ['./package-billings.component.css']
})
export class PackageBillingsComponent implements OnInit {
	loggedIn: boolean;
  	packageDetails:any;
	packageErr: any;
	users: any;
	selectedBillingUser: any;
	disableBillingBtn: boolean = false;
	selectedDuration: boolean = true;

	constructor(
		public dialog: MatDialog,
		public _route: Router,
		private packageBillingsService:PackageBillingsService, 
		private auth:AuthService, 
		private _cookieService:CookieService, 
		private userService:UserService,
		public snackBar: MatSnackBar
	) { }

	ngOnInit() {
		let cookieVal = this._cookieService.getAll();
		if(cookieVal['authToken'] && cookieVal['authToken'].length>0){
			this.loggedIn = true;
			if(parseInt(cookieVal['idx'])===10){
				this.getUsers();
			}
		}
		this.getPackages();
	}

  	getPackages(){
  		this.packageBillingsService.getPackages()
  			.subscribe(packageDetails=>{
  				this.packageDetails = packageDetails;
  				this.packageDetails.sort(function (a, b) {
					return a.packages.cost - b.packages.cost;
				});
  			}, error=>{
  				this.packageErr = 'Failed to retrive package billings';
  			})
  	}

  	getUsers(){
  		this.userService.findByQuery([{role:20},{status:true}])
			.subscribe(users=>{
				this.users = users;
			}, error=>{
				this.packageErr = 'Failed to get users';
			})
  	}

  /*	selectPackage(featurePackage:FeaturePackage=<FeaturePackage>{}){
  		this.auth.getCookies()
			.then(cookieObj=>{
				if(cookieObj && cookieObj["authToken"] !== undefined && cookieObj["authToken"].length>0){
					this.disableBillingBtn = true;
					if(parseInt(cookieObj['idx'])===10){
						if(this.selectedBillingUser!==undefined){
							featurePackage['selectedBillingUser']=this.selectedBillingUser;
							let filterEmail = this.users.filter(user=>{
								if(user._id == this.selectedBillingUser){
									return user;
							    }
							});
							featurePackage['selectedBillingUserEmail']=filterEmail[0]['email'];
							this.packageBillingsService.submitPackage(featurePackage)
								.subscribe(packageInfo=>{
									this.disableBillingBtn = false;
									this.selectedBillingUser = undefined;
									let alertMsg = JSON.parse(JSON.stringify(packageInfo));
									let snackBarRef = this.snackBar.open(alertMsg, '', {
			      						duration: 3000,
			    					});
			    					snackBarRef.afterDismissed().subscribe(() => {
										location.reload();
									});
								}, error => {
									this.disableBillingBtn = false;
									this.packageErr = 'Failed to Setup Package';
								});
						}else{
							this.disableBillingBtn = false;
							alert('User Not selected for Billing');
						}
					}else{
						this.packageBillingsService.submitPackage(featurePackage)
							.subscribe(packageInfo=>{
								this.disableBillingBtn = false;
								let alertMsg = JSON.parse(JSON.stringify(packageInfo));
								let snackBarRef = this.snackBar.open(alertMsg, '', {
		      						duration: 3000,
		    					});
		    					snackBarRef.afterDismissed().subscribe(() => {
									location.reload();
								});
							}, error => {
								this.disableBillingBtn = false;
								this.packageErr = 'Failed to Setup Package';
							});
					}
				}
			});
  	}*/

  	checkoutPackage(packageId){
  		let checkoutObject = {
			product: 'package',
			productId: packageId
		};
		if(this.selectedDuration == true){
			checkoutObject['billingType'] = 'monthly';
		}else{
			checkoutObject['billingType'] = 'annual';
		}

		if(JSON.stringify(checkoutObject) !== '{}'){
			localStorage.setItem('checkoutData', JSON.stringify(checkoutObject));
			this._route.navigate(['/app/checkout']);
		}
  	}

  	openRegisterModal(featurePackage:FeaturePackage=<FeaturePackage>{}){
		let dialogOptions = {
  			width: '620px',
  			disableClose: true
		};

		dialogOptions["data"] = {};
		if(JSON.stringify(featurePackage) !== '{}'){
			if(this.selectedDuration == false){
				featurePackage.cost = featurePackage.cost/12;
				if(featurePackage.cost === 0){
					featurePackage['days'] = 1;
				}else{
					featurePackage['days'] = 30;
				}
			}
			// dialogOptions["data"]["featurePackage"] = featurePackage;
			let packageDetailsArr = JSON.parse(JSON.stringify(this.packageDetails));
			packageDetailsArr.sort(function (a, b) {
  				return b.packages.priorityLevel - a.packages.priorityLevel;
			});
			dialogOptions["data"]["featurePackage"] = JSON.parse(JSON.stringify(packageDetailsArr[0]['packages']));
		}

		let dialogRef = this.dialog.open(RegisterComponent, dialogOptions);
		dialogRef.afterClosed().subscribe(result => {
			this.selectedDuration = true;
			this.getPackages();
			if(result && result!=='opt-cancel'){
				this.showRegisterSuccess();
			}
    	});
	}

	showRegisterSuccess(){
	
		let dialogOptions = {
  			width: '600px',
  			disableClose: true
		};

		let dialogRef = this.dialog.open(RegisterSuccessDialogComponent, dialogOptions);
    }
}
