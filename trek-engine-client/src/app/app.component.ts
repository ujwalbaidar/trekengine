import { Component, OnInit } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AuthService, UserService } from './services/index';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { CookieService } from 'angular2-cookie/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'trek-engine-app',
  providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit { 
	public urlParams:any;
	public sub: any;
	constructor(
		private auth:AuthService, 
		public userService:UserService, 
		private _route:Router, 
		private activatedRoute: ActivatedRoute, 
		private location: Location,
		public _cookieService:CookieService
	){}

	ngOnInit(){
		this.navigateAppRoute();
	}

	navigateAppRoute(){
		let publicPath = ['/login', '/register', '/home', '/forgot-password'];
		if(JSON.stringify(this._cookieService.getAll()) !== '{}'){
			if(this._cookieService.get('authToken') && this._cookieService.get('authToken').length>0){
				this.auth.validateToken(this._cookieService.get('authToken'))
					.subscribe(validationResponse=>{
						if(JSON.stringify(validationResponse) !== '{}'){
							if(publicPath.includes(this.location.path()) || (this.location.path().indexOf('/change-password/token/') > -1) || (this.location.path().indexOf('/authorization/token/') > -1) ){
								this._route.navigate(['/app']);
							}else{
								if(this.location && this.location.path() === ''){
									this._route.navigate(['/app']);
								}else{
									this._route.navigate([this.location.path()]);
								}
							}
						}else{
							this._cookieService.removeAll();
							window.location.href = environment.webUrl;
						}
					}, error =>{
						this._cookieService.removeAll();
						window.location.href = environment.webUrl;
					});
			}else{
				this._cookieService.removeAll();
				this._route.navigate(['/home']);
			}
		}else{
			if( publicPath.includes(this.location.path()) || (this.location.path().indexOf('/change-password/token/') > -1) || (this.location.path().indexOf('/authorization/token/') > -1) ){
				this._route.navigate([this.location.path()]);
			}else{
				this._route.navigate(['/home']);
			}
		}
	}
}
