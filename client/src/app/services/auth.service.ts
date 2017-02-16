import { Injectable } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';

@Injectable()
export class AuthService {
	constructor(public _cookieService:CookieService){}
	getCookies(): Promise<Object> {
		return Promise.resolve(this._cookieService.getAll());
	}

	setCookies(token:string){
		this._cookieService.put('authToken', token);
	}

	clearCookies(){
		this._cookieService.removeAll();
	}
}