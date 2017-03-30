import { Component, OnInit } from '@angular/core';
import { User } from '../models/models';
import { UserService, AuthService } from '../services/index';
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

	constructor(private userService: UserService, private authService: AuthService, private _route: Router, private activatedRoute: ActivatedRoute){}
	
	ngOnInit(){
		this.getRouteParams();
	}
	
	registerUser(form:any) {
		this.submitted = true;
		if(form.valid == true){
			this.userService.registerUser(this.user)
				.subscribe(
					registerUser=>{
						this.submitted = false;
						this.successMessage = "Registered Successfully!";
						if(this.urlParams && this.urlParams['email'] !== undefined){
							setTimeout(()=>{ 
								this.addSender();
							}, 2000);
						}else{
							setTimeout(()=>{ 
								this._route.navigate(['/login']);
							}, 3000);
						}
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
}
