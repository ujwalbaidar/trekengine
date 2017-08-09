import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { User } from '../../models/models';
import { UserService, AuthService, PackageBillingsService } from '../../services/index';
import { environment } from '../../../environments/environment';
import { CookieService } from 'ngx-cookie';

@Component({
  selector: 'app-validate-register',
  templateUrl: './validate-register.component.html',
  styleUrls: ['./validate-register.component.css']
})
export class ValidateRegisterComponent implements OnInit {
	user: User = <User>{domain:{website:'', protocol:''}};
	protocols = [
		{ 'id': '1', 'name': 'http', 'value': 'http://'},
		{ 'id': '2', 'name': 'https', 'value': 'https://'}
	];
	subittedRegisterForm: Boolean = false;
	disbleSubmitBtn: boolean = false;
	userAuths: any;
	validateErr: any;
	isNew: boolean;

	constructor(public _cookieService:CookieService, private _route: Router, private activatedRoute: ActivatedRoute, public userService: UserService, public authService: AuthService) { 
		this.user['domain']['protocol'] = 'http://';
	}

	ngOnInit() {
		this.activatedRoute.params.subscribe(params => {
			this.authorizeCode(params['code'], params['loginType']);
	    });
	}

	registerUser(form:any) {
		this.subittedRegisterForm = true;
		if(form.valid == true){
			this.disbleSubmitBtn = true;
			this.userService.registerOAuthUser(this.user, this.userAuths)
				.subscribe(registerResponse=>{
					this.setCookies(registerResponse)
						.then(success=>{
							if(success){
								this._route.navigate(['/app']);
							}
						});
				}, registerErr=>{
					this.subittedRegisterForm = false;
					this.disbleSubmitBtn = false;
				});
		}
	}

	authorizeCode(authCode, loginType){
		let userEmail = this._cookieService.get('email');
		if(userEmail !== undefined){
			var paramObj = {code:authCode, loginType: loginType, email: userEmail};
		}else{
			var paramObj = {code:authCode, loginType: loginType, email: ''};
		}
		this.userService.validateOAuthCode(paramObj)
			.subscribe(authInfos=>{
				if(authInfos && authInfos.isNew == true){
					this.isNew = true;
					this.userAuths = authInfos;
				}else{
					this.isNew = false;
					if(authInfos.redirect && authInfos.redirect === true){
						this._route.navigate(['/app/profile']);
					}else{
						this.setCookies(authInfos)
							.then(success=>{
								if(success){
									this._route.navigate(['/app']);
								}
							});
					}
				}
			}, authError=>{
				this.validateErr = authError;
			});
	}

	setCookies(cookieParams){
		return new Promise(resolve=>{
			this.authService.setCookies('authToken',cookieParams['token']);
			this.authService.setCookies('idx',cookieParams['index']);
			this.authService.setCookies('hostOrigin', window.location.origin);
			this.authService.setCookies('email', cookieParams['email']);
			if(cookieParams['packageType'] && cookieParams['remainingDays']) {
				this.authService.setCookies('packageType',cookieParams['packageType']);
				this.authService.setCookies('remainingDays',cookieParams['remainingDays']);
				if(cookieParams['remainingDays']>0){
					this.authService['validatedUser'] = true;
				}
			}
			resolve(true);
		});
	}
}
