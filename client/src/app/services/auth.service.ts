import { Injectable } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';
import { Router } from '@angular/router';

@Injectable()
export class AuthService {
	hrs:any[];
	mins: any[];
	constructor(public _cookieService:CookieService, private _route: Router){}
	getCookies(): Promise<Object> {
		return Promise.resolve(this._cookieService.getAll());
	}

	setCookies(key:string, value:string){
		this._cookieService.put(key, value);
	}

	clearCookies(){
		this._cookieService.removeAll();
	}

	logout(){
		this.clearCookies();
		this._route.navigate(['/login']);
	}

	developTimePicker(){
		for(let i=0; i<24;i++){
			if(this.hrs == undefined){
				this.hrs = [];
			}
			if(i<10){
				this.hrs.push('0'+i);
			}else{
				this.hrs.push(JSON.stringify(i));
			}
		}
		for(let i=0; i<=55;i+=5){
			if(this.mins == undefined){
				this.mins = [];
			}
			if(i<10){
				this.mins.push('0'+i);
			}else{
				this.mins.push(JSON.stringify(i));
			}
		}
		let time = {hrs:this.hrs,mins:this.mins};
		return time;
	}
}