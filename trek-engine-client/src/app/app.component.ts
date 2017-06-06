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
/*		this.auth.getCookies()
			.then(cookieObj=>{
				this.getRouteParams().then(hasParams=>{
					if(hasParams === true){
						this.checkParamQueries().then(hasUser=>{
							if(hasUser['check']==true){
								if(hasUser['data']['role']>20){
									this.addSender(cookieObj);
								}else{
									var confirmRequest = confirm('Do you want to change your role to guide?');
									if(confirmRequest == true){
										this.updateUser(cookieObj);
									}else{
										alert('Request to Assign you as guide has been suspended');
										if(cookieObj["authToken"] !== undefined && cookieObj["authToken"].length>0){
											this._route.navigate(['/app']);
										}else{
											this._route.navigate(['/login']);
										}
									}
								}
							}else{
								this._route.navigate(['/register'],{queryParams: this.urlParams});
							}
						});
					}else{
						this.navigatePage(cookieObj);
					}
				});
			});*/
	}

	navigateAppRoute(){
		let publicPath = ['/login', '/register', '/home', '/authorization/token/', '/authorization/token/'];
		if(JSON.stringify(this._cookieService.getAll()) !== '{}'){
			if(this._cookieService.get('authToken') && this._cookieService.get('authToken').length>0){
				this.auth.validateToken(this._cookieService.get('authToken'))
					.subscribe(validationResponse=>{
						if(JSON.stringify(validationResponse) !== '{}'){
							if(publicPath.includes(this.location.path())){
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
			if(publicPath.includes(this.location.path())){
				this._route.navigate([this.location.path()]);
			}else{
				this._route.navigate(['/home']);
			}
		}
	}

/*	ngOnDestroy(){
        this.sub.unsubscribe();
    }*/

	/*getRouteParams(){
		return new Promise(resolve=>{
			setTimeout(()=>{
				this.sub = this.activatedRoute.queryParams.subscribe((params:Params)=>{
					if(params && params['email'] !== undefined){
						this.urlParams = params;
						resolve(true);
					}else{
						resolve(false);
					}
				});
			}, 1);
		});
	}*/

	/*checkParamQueries(){
		return new Promise(resolve=>{
			let queries = [
				{'email': this.urlParams.email}
			];
			this.userService.queryUser(queries)
				.subscribe(user=>{
					if(user && user['email']){
						resolve({check:true, data:user});
					}else{
						resolve({check:false, data:user});
					}
				}, userError=>{
					console.log(userError);
				});
		})
	}
*/
	/*updateUser(cookieObj:Object){
		this.userService.updateUser({role:30}, this.urlParams.email)
			.subscribe(user=>{
				this.auth.clearCookies();
				alert('Your role has been assigned as Guide');
				this._route.navigate(['/login']);
			},updateError=>{
				console.log(updateError);
			});
	}*/

	/*addSender(cookieObj:Object){
		this.userService.updateVendors(this.urlParams)
			.subscribe(user=>{
				if(user['success'] == true){
					this.auth.clearCookies();
					alert(user['message']);
				}else{
					alert(user['message']);
				}
				if(cookieObj && cookieObj["authToken"] !== undefined && cookieObj["authToken"].length>0){
					this._route.navigate(['/app']);
				}else{
					this._route.navigate(['/login']);
				}
			},updateError=>{
				console.log(updateError);
			});
	}*/

	/*navigatePage(cookieObj:Object) {
		if(cookieObj["authToken"] !== undefined && cookieObj["authToken"].length>0){
			if(this.location.path() == ''){
				this._route.navigate(['/app']);
			}else{
				if(this.location.path() ==='/login' || this.location.path() ==='/register' || this.location.path() === '/home'){
					this._route.navigate(['/app']);
				}else{
					this._route.navigate([this.location.path()]);
				}
			}
		}else{
			if(this.location.path() ==='/login' || this.location.path() ==='/register' || this.location.path() === '/home'){
				this._route.navigate([this.location.path()]);
			}else if(this.location.path().includes('/authorization/token/') || this.location.path().includes('/forgot-password/token')){
				this._route.navigate([this.location.path()]);
			}else{
				this._route.navigate(['/home']);
			}
		}
	}*/
}
