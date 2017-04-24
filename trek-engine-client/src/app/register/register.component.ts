import { Component, OnInit } from '@angular/core';
import { User } from '../models/models';
import { UserService, AuthService, PackageBillingsService } from '../services/index';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
	user: User = <User>{};
	errMessage: string;
	successMessage: string;
	public urlParams:any;
	displayPaymentOption: boolean=false;
	serviceType: string;
	registerUserInfo: any;
	showLoading: boolean;

	subittedRegisterForm: Boolean;
	featurePackage: any;
	title: string;
	packageDetails: any;
	packageErr: any;
	disbleSubmitBtn: boolean = false;
	duplicateEmailErr: string;

	constructor(
		private userService: UserService, 
		private authService: AuthService, 
		private packageBillingsService: PackageBillingsService,
		private _route: Router, 
		private activatedRoute: ActivatedRoute,
		public dialogRef: MdDialogRef<RegisterComponent>, 
	){
		if(this.dialogRef._containerInstance.dialogConfig.data){
			if(this.dialogRef._containerInstance.dialogConfig.data.featurePackage){
				this.featurePackage = Object.assign({}, this.dialogRef._containerInstance.dialogConfig.data.featurePackage);
				this.title = 'Register for '+this.featurePackage.name+' Package';
			}else{

			}
		}
	}
	
	ngOnInit(){
	}
	
	registerUser(form:any) {
		this.subittedRegisterForm = true;
		if(form.valid == true){
			this.disbleSubmitBtn = true;
			this.user['selectedPackage'] = this.featurePackage;
			this.userService.registerUser(this.user)
				.subscribe(registerUser=>{
					this.subittedRegisterForm = false;
					this.disbleSubmitBtn = false;
					this.dialogRef.close(this.user);
				}, error=>{
					this.disbleSubmitBtn = false;
					if(error.errBody.data && error.errBody.data.code === 11000){
						this.duplicateEmailErr = "Email Already Exists!";
					}else{
						this.errMessage = "Failed to Register User!";
					}
					setTimeout(()=>{ 
						this.errMessage = "";
					}, 3000);
				});
		}
	}


	addSender(){
		this.userService.updateVendors(this.urlParams)
			.subscribe(user=>{
				if(user['success'] == true){
					alert(user['message']);
				}else{
					alert(user['message']);
				}
				this.authService.clearCookies();
				this._route.navigate(['/login']);
			},updateError=>{
				console.log(updateError);
			});
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

	/*registeredUserInfo(proceedType){
		if(proceedType == 'proceed'){
			this.registerUserInfo.billingInfo['freeUser']=false;
			this.packageBillingsService.updateAppPackage(this.registerUserInfo.billingInfo)
			.subscribe(updateResponse=>{
				this.successMessage = 'Payment is successfully setup!';
				setTimeout(()=>{ 
					this.userService.loginUser({email:this.user.email, password:this.user.password})
					.subscribe(loginUser=>{
						this.authService.setCookies('authToken',loginUser['token']);
						this.authService.setCookies('idx',loginUser['index']);
						this.authService.setCookies('hostOrigin', window.location.origin);
						this._route.navigate(['/app']);
					}, error=>{
						this.errMessage = 'Failed to login!';
					});
				}, 3000);
			},updateError=>{
				this.errMessage = 'Failed to proceed payment'
			});
		}else if(proceedType == 'login'){
			this.userService.loginUser({email:this.user.email, password:this.user.password})
				.subscribe(loginUser=>{
					this.authService.setCookies('authToken',loginUser['token']);
					this.authService.setCookies('idx',loginUser['index']);
					this.authService.setCookies('hostOrigin', window.location.origin);
					this._route.navigate(['/app']);
				}, error=>{
					this.errMessage = 'Failed to login!';
				});

		}
	}*/
}