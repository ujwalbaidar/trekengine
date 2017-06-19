import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { User } from '../../models/models';
import { UserService, AuthService, PackageBillingsService } from '../../services/index';

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

	constructor(private _route: Router, private activatedRoute: ActivatedRoute, public userService: UserService, public authService: AuthService) { 
		this.user['domain']['protocol'] = 'http://';
	}

	ngOnInit() {
		this.activatedRoute.params.subscribe(params => {
			this.user['code'] = params['code'];
			this.user['loginType'] = params['loginType'];
	    });
	}

	registerUser(form:any) {
		this.subittedRegisterForm = true;
		if(form.valid == true){
			this.disbleSubmitBtn = true;
			this.userService.registerOAuthUser(this.user)
				.subscribe(registerResponse=>{
					this.authService.setCookies('authToken',registerResponse['token']);
					this.authService.setCookies('idx',registerResponse['index']);
					this.authService.setCookies('hostOrigin', window.location.origin);
					this.authService.setCookies('email', registerResponse['email']);
					if(registerResponse['packageType'] && registerResponse['remainingDays']) {
						this.authService.setCookies('packageType',registerResponse['packageType']);
						this.authService.setCookies('remainingDays',registerResponse['remainingDays']);
						if(registerResponse['remainingDays']>0){
							this.authService['validatedUser'] = true;
						}
					}
					this._route.navigate(['/app']);
				}, registerErr=>{
					this.subittedRegisterForm = false;
					this.disbleSubmitBtn = false;
					console.log(registerErr);
				});
		}
	}

}
