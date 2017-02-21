import { Component, OnInit } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AuthService } from './services/index';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'trek-engine-app',
  providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit { 
	constructor(private auth:AuthService, private _route:Router, private activatedRoute: ActivatedRoute, private location: Location){}
	ngOnInit(){
		this.auth.getCookies()
			.then(cookieObj=>{
				if(cookieObj["authToken"] !== undefined && cookieObj["authToken"].length>0){
					if(this.location.path() !=='/login' || this.location.path() !=='/register'){
						this._route.navigate([this.location.path()]);
					}else{
						this._route.navigate(['/']);
					}
				}else{
					if(this.location.path() ==='/login' || this.location.path() ==='/register'){
						this._route.navigate([this.location.path()]);
					}else{
						this._route.navigate(['/login']);
					}
				}
			});
	}
}
