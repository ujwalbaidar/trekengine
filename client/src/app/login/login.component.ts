import { Component, OnInit } from '@angular/core';
import { User } from '../models/models';
import { AuthService, UserService } from '../services/index';
import { Router } from '@angular/router';
import { MdSnackBar } from '@angular/material';
import { ConfirmationBoxComponent } from '../confirmation-box/confirmation-box.component';
import { MdDialog } from '@angular/material';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent{
	user: User = <User>{domain:{website:'', protocol:''}};
	errObj: any;
	submittedLoginForm: boolean = false;
	subittedOrgForm: boolean = false;
	disbleOrgSubmitBtn: boolean = false;
	authUrls = [];
	activePage: Number = 1;
	protocols = [
		{ 'id': '1', 'name': 'http', 'value': 'http://'},
		{ 'id': '2', 'name': 'https', 'value': 'https://'}
	];
	constructor(private userService: UserService, private authService: AuthService, private _route: Router, public snackBar: MdSnackBar, public dialog: MdDialog){}
	
	ngOnInit(){
		this.getOauthUrl();
	}

	loginUser(form:any){
		this.submittedLoginForm = true;
		this.errObj = {};
		if(form.valid == true){
			this.userService.loginUser(this.user)
				.subscribe(loginUser=>{
 					if(loginUser.success === true){
						this.submittedLoginForm = false;
						this.authService.setCookies('authToken',loginUser['token']);
						this.authService.setCookies('idx',loginUser['index']);
						this.authService.setCookies('hostOrigin', window.location.origin);
						this.authService.setCookies('email', loginUser['email']);
						this.authService.setCookies('userName', loginUser['userName']);
						if(loginUser['packageType'] && loginUser['remainingDays']) {
							this.authService.setCookies('packageType',loginUser['packageType']);
							this.authService.setCookies('remainingDays',loginUser['remainingDays']);
							if(loginUser['remainingDays']>0){
								this.authService['validatedUser'] = true;
							}
						}else{
							this.authService['validatedUser'] = false;
						}

						if (parseInt(loginUser.index) === 20) {
							this._route.navigate(['/app/bookings']);
						}else if(parseInt(loginUser.index) === 30){
							this._route.navigate(['/app/movements']);
						}else if(parseInt(loginUser.index) === 10){
							this._route.navigate(['/app']);
						}else{
							this._route.navigate(['/app/profile']);
						}
					}else{
						if(loginUser.errorCode === 2){
							this.errObj = {errType:'email', message: loginUser.message};
						}else if(loginUser.errorCode === 3){
							this.errObj = {errType:'password', message: loginUser.message};
						}else if(loginUser.errorCode === 4){
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
					    			this.user['domain']['protocol']='https://';
									this.activePage = 4;
					    		}
					    	});
						}else if(loginUser.errorCode === 6){
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
					    			this.sendNewActivationLink(this.user);
					    		}
					    	});
						}else{
							this._route.navigate(['/login']);
						}
					}

				}, error=>{
					if(error.errBody.data.errorCode && error.errBody.data.errorCode == 'emailErr'){
						this.errObj = {errType:'email', message: error.errBody.message};
					}else if(error.errBody.data.errorCode && error.errBody.data.errorCode == 'passwordErr'){
						this.errObj = {errType:'password', message: error.errBody.message};
					}else{
						this.errObj = {errType: null, message: error.errBody.message};
						this.snackBar.open('Failed to Login', '', {
      						duration: 5000,
    					});
					}
				});
		}
	}

	getOauthUrl(){
		this.userService.getOauthUrls()
			.subscribe(authUrls=>{
				this.authUrls = authUrls;
			});
	}

	redirectOauthUrl(url:string){
		window.location.href = url;
	}

	submitOrgInfo(form:any){
		this.subittedOrgForm = true;
		if(form.valid == true){
			this.disbleOrgSubmitBtn = true;
			this.userService.completeRegistrationProcess(this.user)
				.subscribe(successResp=>{
					if(successResp.success == true){
						this.activePage = 5;
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

	sendNewActivationLink(userData){
		this.userService.sendActivationLink(userData)
			.subscribe(successResp=>{
				this.activePage = 7;
			}, error=>{
				this.snackBar.open('Error has been occured for the action.', '', {
						duration: 3000,
					});
					setTimeout(()=>{ 
						location.reload();
					}, 3000);
			});
	}

	setLoginPage(page:Number){
		this.user = <User>{domain:{website:'', protocol:''}};
		this.submittedLoginForm = false;
		this.subittedOrgForm = false;
		this.disbleOrgSubmitBtn = false;
		this.activePage = page;
	}
}