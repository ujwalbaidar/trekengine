import { Injectable } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';
import { Router } from '@angular/router';

@Injectable()
export class AuthService {
	constructor(public _cookieService:CookieService, private _route: Router){}
	getCookies(): Promise<Object> {
		return Promise.resolve(this._cookieService.getAll());
	}

	setCookies(token:string){
		this._cookieService.put('authToken', token);
	}

	clearCookies(){
		this._cookieService.removeAll();
	}

	logout(){
		this.clearCookies();
		this._route.navigate(['/login']);
	}
}