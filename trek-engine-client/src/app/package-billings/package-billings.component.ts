import { Component, OnInit } from '@angular/core';
import { PackageBillingsService, AuthService, UserService } from '../services';
import { FeaturePackage } from '../models/models';
import { CookieService } from 'angular2-cookie/core';
import { MdDialog } from '@angular/material';
import { RegisterComponent, RegisterSuccessDialogComponent } from '../register/register.component';
import { Router } from '@angular/router';
import { MdSnackBar } from '@angular/material';

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

	constructor(
		public dialog: MdDialog,
		public _route: Router,
		private packageBillingsService:PackageBillingsService, 
		private auth:AuthService, 
		private _cookieService:CookieService, 
		private userService:UserService,
		public snackBar: MdSnackBar
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

  	selectPackage(featurePackage:FeaturePackage=<FeaturePackage>{}){
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
									alert(packageInfo);
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
								alert(packageInfo);
							}, error => {
								this.disableBillingBtn = false;
								this.packageErr = 'Failed to Setup Package';
							});
					}
				}
			});
  	}

  	openRegisterModal(featurePackage:FeaturePackage=<FeaturePackage>{}){
		let dialogOptions = {
			height: '550px',
  			width: '600px',
  			position: 'center',
  			disableClose: true
		};

		dialogOptions["data"] = {};
		if(JSON.stringify(featurePackage) !== '{}'){
			dialogOptions["data"]["featurePackage"] = featurePackage;
		}

		let dialogRef = this.dialog.open(RegisterComponent, dialogOptions);
		dialogRef.afterClosed().subscribe(result => {
			if(result && result!=='opt-cancel'){
				this.showRegisterSuccess();
			}
    	});
	}

	showRegisterSuccess(){
	
		let dialogOptions = {
			height: '210px',
  			width: '600px',
  			position: 'center',
  			disableClose: true
		};

		let dialogRef = this.dialog.open(RegisterSuccessDialogComponent, dialogOptions);
    }

}
