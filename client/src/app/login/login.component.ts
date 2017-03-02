import { Component, OnInit } from '@angular/core';
import { User } from '../register/register.model';
import { AuthService, UserService } from '../services/index';
import { Router } from '@angular/router';

@Component({
    selector: 'login',
    templateUrl: './src/app/login/login.component.html',
    styleUrls: ['./src/app/login/login.component.css'],
})
export class LoginComponent implements OnInit {
	user: User = <User>{};
	errObj: any;
	constructor(private userService: UserService, private authService: AuthService, private _route: Router){}
	ngOnInit(){}
	loginUser(form:any){
		this.errObj = {};
		if(form.valid == true){
			this.userService.loginUser(this.user)
				.subscribe(
					loginUser=>{
						this.authService.setCookies('authToken',loginUser['token']);
						this.authService.setCookies('idx',loginUser['index']);
						this._route.navigate(['/']);
					}, error=>{
						if(error.errBody.data.errorCode && error.errBody.data.errorCode == 'emailErr'){
							this.errObj = {errType:'email', message: error.errBody.message};
						}else if(error.errBody.data.errorCode && error.errBody.data.errorCode == 'passwordErr'){
							this.errObj = {errType:'password', message: error.errBody.message};
						}else{
							this.errObj = {errType: null, message: error.errBody.message};
						}
					});
		}
	}
}