import { Component, OnInit } from '@angular/core';
import { User } from '../models/models';
import { UserService, AuthService, PackageBillingsService } from '../services/index';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MdSnackBar } from '@angular/material';
import { MdDialog } from '@angular/material';
import { ConfirmationBoxComponent } from '../confirmation-box/confirmation-box.component';

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
	user: User = <User>{domain:{website:'', protocol:''}};
	errMessage: string;
	successMessage: string;
	public urlParams:any;
	displayPaymentOption: boolean=false;
	serviceType: string;
	registerUserInfo: any;
	showLoading: boolean;

	subittedRegisterForm: Boolean = false;
	subittedOrgForm: Boolean = false;

	featurePackage: any;
	title: string;
	packageDetails: any;
	packageErr: any;
	disbleSubmitBtn: boolean = false;
	duplicateEmailErr: string;
	protocols = [
		{ 'id': '1', 'name': 'http', 'value': 'http://'},
		{ 'id': '2', 'name': 'https', 'value': 'https://'}
	];
	selectedProtocol: string;
	authUrls = [];
	activePage: Number = 1;

	constructor(
		private userService: UserService, 
		private authService: AuthService, 
		private packageBillingsService: PackageBillingsService,
		private _route: Router, 
		private activatedRoute: ActivatedRoute,
		public dialog: MdDialog,
		public snackBar: MdSnackBar
	){
		// if(this.dialogRef._containerInstance.dialogConfig.data){
		// 	if(this.dialogRef._containerInstance.dialogConfig.data.featurePackage){
		// 		this.featurePackage = Object.assign({}, this.dialogRef._containerInstance.dialogConfig.data.featurePackage);
		// 		this.title = 'Register for '+this.featurePackage.name+' Package';
		// 		this.user['domain']['protocol'] = 'http://';
		// 	}else{

		// 	}
		// }
	}
	
	ngOnInit(){
		this.getOAuthUrl();
	}
	
	registerUser(form:any) {
		this.subittedRegisterForm = true;
		if(form.valid == true){
			this.disbleSubmitBtn = true;
			this.userService.registerUser(this.user)
				.subscribe(registerUser=>{
					if(registerUser.success == false){
						if(registerUser.errorCode == 2){
							let dialogOptions = {
					  			width: '600px',
					  			position: 'center',
					  			disableClose: true
							};

							dialogOptions["data"] = {
								title: 'Company Information is Incomplete',
								errorMessage: 'Email is already been registered but Company Information is empty.',
								confirmationMessage: 'Submit Company Information?'
							};
							
							let dialogRef = this.dialog.open(ConfirmationBoxComponent, dialogOptions);
					    	dialogRef.afterClosed().subscribe(result => {
					    		let selectedOption = parseInt(result);
					    		if(selectedOption == 1){
									this.activePage = 2;
					    		}
					    	});
						}else if(registerUser.errorCode == 4){
							let dialogOptions = {
					  			width: '600px',
					  			position: 'center',
					  			disableClose: true
							};

							dialogOptions["data"] = {
								title: 'Account is not Activated',
								errorMessage: 'Account already been created by this email but not activated.',
								confirmationMessage: 'Send New Activation Link?'
							};
							
							let dialogRef = this.dialog.open(ConfirmationBoxComponent, dialogOptions);
					    	dialogRef.afterClosed().subscribe(result => {
					    		let selectedOption = parseInt(result);
					    		if(selectedOption == 1){
									console.log('send activation link');
									console.log(this.user)
					    		}
					    	});
						}else{
							let dialogOptions = {
					  			width: '600px',
					  			position: 'center',
					  			disableClose: true
							};

							dialogOptions["data"] = {
								title: 'Account is Active',
								errorMessage: 'Account with this email is already been active.',
								confirmationMessage: 'Navigate to Login page?'
							};
							
							let dialogRef = this.dialog.open(ConfirmationBoxComponent, dialogOptions);
					    	dialogRef.afterClosed().subscribe(result => {
					    		let selectedOption = parseInt(result);
					    		if(selectedOption == 1){
									this._route.navigate(['/login']);
					    		}
					    	});
						}
					}else{
						this.activePage = 2;
					}
					this.subittedRegisterForm = false;
					this.disbleSubmitBtn = false;
				}, error=>{
					this.snackBar.open('Error has been occured for the action.', '', {
							duration: 3000,
						});
						setTimeout(()=>{ 
							location.reload();
						}, 3000);
				});
		}
	}

	submitOrgInfo(form:any){
		this.subittedOrgForm = true;
		if(form.valid == true){
			this.disbleSubmitBtn = true;
			this.userService.completeRegistrationProcess(this.user)
				.subscribe(successResp=>{
					if(successResp.success == true){
						this.activePage = 3;
					}
				}, error=>{
					this.snackBar.open('Error has been occured for the action.', '', {
							duration: 3000,
						});
						setTimeout(()=>{ 
							location.reload();
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

	getOAuthUrl(){
		this.userService.getOauthUrls()
			.subscribe(authUrls=>{
				this.authUrls = authUrls;
			});
	}

	redirectOauthUrl(url:string){
		window.location.href = url;
	}
}

@Component({
	selector: 'register-success-dialog',
	templateUrl: './register-success-dialog.component.html',
})

export class RegisterSuccessDialogComponent {
	constructor() {}
}
