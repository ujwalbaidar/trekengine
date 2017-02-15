import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/index';
import { Router } from '@angular/router';

@Component({
  selector: 'trek-engine-app',
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit { 
	constructor(private auth:AuthService, private _route:Router){}
	ngOnInit(){
		this.auth.getCookies()
			.then(cookieObj=>{
				if(cookieObj["authToken"] !== undefined && cookieObj["authToken"].length>0){
					this._route.navigate(['/dashboard']);
				}else{
					this._route.navigate(['/login']);
				}
			});
	}
}
