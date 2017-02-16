import { Component, OnInit } from '@angular/core';
import { User } from './register.model';
import { UserService } from '../services/index';
import { Router } from '@angular/router';

@Component({
    selector: 'register',
    templateUrl: './src/app/register/register.component.html',
    styleUrls: ['./src/app/register/register.component.css'],
})
export class RegisterComponent implements OnInit {
	user: User = <User>{};
	submitted: Boolean;
	errMessage: string;
	successMessage: string;

	constructor(private userService: UserService, private _route: Router){}
	
	ngOnInit(){}
	
	registerUser(form:any) {
		this.submitted = true;
		if(form.valid == true){
			this.userService.registerUser(this.user)
				.subscribe(
					registerUser=>{
						this.submitted = false;
						this.successMessage = "Registered Successfully!";
						setTimeout(()=>{ 
							this._route.navigate(['/login']);
						}, 3000);
					}, error=>{
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
}