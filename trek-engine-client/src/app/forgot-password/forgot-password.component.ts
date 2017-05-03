import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfilePassword } from '../models/models';
import { UserService } from '../services';
import { MdSnackBar } from '@angular/material';

@Component({
	selector: 'app-forgot-password',
	templateUrl: './forgot-password.component.html',
	styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
	public profilePassword: ProfilePassword;
	submittedPasswordForm:boolean = false;
	paramsToken: string;
	expireToken: boolean = false;
	disableSubmitBtn: boolean = false;

	constructor(private route: ActivatedRoute, private _route: Router, public userService: UserService, public snackBar: MdSnackBar) { }

	ngOnInit() {
		this.profilePassword = {
			userPassword: '',
			confirmPassword: ''
		};
		this.route.params.subscribe(params => {
			this.paramsToken = params.token;
	    });
	}

	submitPasswordInfo(passwordForm:any, passwordData: object){
		this.submittedPasswordForm = true;
		if(passwordForm.valid){
			this.disableSubmitBtn = true;
			this.userService.resetUserPassword(this.paramsToken, passwordForm.value)
				.subscribe(updateData=>{
					let response = JSON.parse(JSON.stringify(updateData));
					if (response == 'token-expired') {
						this.expireToken = true;
					}else{
						this.profilePassword = {
							userPassword: '',
							confirmPassword: ''
						};
						setTimeout(()=>{ 
							this._route.navigate(['/app']);
						}, 3000);
						this.snackBar.open('Password updated successfully!', '', {
	  						duration: 2000,
						});
					}
				}, error=>{
					console.log(error);
				});
		}
	}
}
