import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services';
import { MatSnackBar } from '@angular/material';
import { ProfilePassword } from '../models/models';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

@Component({
	selector: 'app-change-password',
	providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }],
	templateUrl: './change-password.component.html',
	styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
	public profilePassword: ProfilePassword;
	submittedPasswordForm:boolean = false;
	paramsToken: string;
	expireToken: boolean = false;
	disableSubmitBtn: boolean = false;

	constructor(
		private route: ActivatedRoute,
		private _route: Router,
		public userService: UserService,
		public snackBar: MatSnackBar,
		private location: Location
	){ }

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
							location.reload();
							this._route.navigate(['/login']);
						}, 3000);

						this.snackBar.open('Password updated successfully!', '', {
	  						duration: 3000,
						});
					}
				}, error=>{
					console.log(error);
				});
		}
	}

}
