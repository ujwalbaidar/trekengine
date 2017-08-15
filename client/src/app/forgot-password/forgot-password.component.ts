import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services';
import { MdSnackBar } from '@angular/material';

@Component({
	selector: 'app-forgot-password',
	templateUrl: './forgot-password.component.html',
	styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
	disableSubmitBtn: boolean = false;
	submittedEmailForm: boolean = false;
	wrongEmail:boolean;
	notActivated:boolean;
	userEmail:string;
	constructor(private route: ActivatedRoute, private _route: Router, public userService: UserService, public snackBar: MdSnackBar) { }

	ngOnInit() {

	}

	submitEmail(form:any){
		this.submittedEmailForm = true;
		if(form.valid == true){
			this.disableSubmitBtn = true;
			this.userService.submitForgotPasswordEmail(this.userEmail)
				.subscribe(userResponse=>{
					let response = JSON.parse(JSON.stringify(userResponse));
					if (response == 'wrong-email') {
						this.wrongEmail = true;
					}else if(response == 'inactive-account'){
						this.notActivated = true;
					}else{
						this.snackBar.open('Email for reset password has been sent.', '', {
      						duration: 5000,
    					});
						this._route.navigate(['/login']);
					}
					this.disableSubmitBtn = false;
				}, error=>{
					this.snackBar.open('Failed send email to reset password.', '', {
  						duration: 5000,
					});
				});
		}
	}
}
