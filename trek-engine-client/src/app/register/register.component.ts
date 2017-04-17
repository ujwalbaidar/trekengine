import { Component, OnInit } from '@angular/core';
import { User } from '../models/models';
import { UserService, AuthService, PackageBillingsService } from '../services/index';
import { ActivatedRoute, Router, Params } from '@angular/router';

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
	user: User = <User>{};
	submitted: Boolean;
	errMessage: string;
	successMessage: string;
	public urlParams:any;
	displayPaymentOption: boolean=false;
	serviceType: string;
	registerUserInfo: any;
	showLoading: boolean;

	constructor(
		private userService: UserService, 
		private authService: AuthService, 
		private packageBillingsService: PackageBillingsService,
		private _route: Router, 
		private activatedRoute: ActivatedRoute
	){
		this.activatedRoute.params.subscribe(params => {
			if(params['serviceType']){
				this.serviceType = params['serviceType'];
			}
	    });
	}
	
	ngOnInit(){
		this.getRouteParams();
	}
	
	registerUser(form:any) {
		this.submitted = true;
		if(form.valid == true){
			this.showLoading = true;
			if(this.serviceType){
				this.user['serviceType'] = this.serviceType;
			}
			this.userService.registerUser(this.user)
				.subscribe(registerUser=>{
					this.showLoading = false;
					this.submitted = false;
					this.successMessage = "Registered Successfully!";
					this.registerUserInfo = registerUser;
					if(this.urlParams && this.urlParams['email'] !== undefined){
						setTimeout(()=>{ 
							this.addSender();
						}, 2000);
					}else{
						if(this.serviceType == 'free'){
							setTimeout(()=>{ 
								this.successMessage = undefined;
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
						}else{
							this.displayPaymentOption = true;
							this.successMessage = undefined;
						}
					}
				}, error=>{
					this.showLoading = false;

					if(error.errBody.data && error.errBody.data.code === 11000){
						this.errMessage = "Email Already Exists!";
					}else{
						this.errMessage = "Failed to Register User!";
					}
					setTimeout(()=>{ 
						this.errMessage = "";
					}, 3000);
				});
		}
	}

	getRouteParams():void {
		this.activatedRoute.queryParams.subscribe((params:Params)=>{
			if(params && params['email'] !== undefined){
				this.urlParams = params;
				this.user.email = params['email'];
				this.user.role = 30;
			}
		});
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

	registeredUserInfo(proceedType){
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
	}
}