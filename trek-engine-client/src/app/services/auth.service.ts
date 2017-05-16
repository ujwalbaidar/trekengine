import { Injectable } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';
import { Router } from '@angular/router';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import * as io from "socket.io-client/dist/socket.io";
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthService {
	hrs:any[];
	mins: any[];
	public url = 'http://localhost:5000';  
	// public url = 'https://www.trekengine.com';  
 	private socket;
 	public validatedUser = false;

	constructor(public _cookieService:CookieService, private _route: Router, private http: Http){
		if(this._cookieService.get('remainingDays') && parseInt(this._cookieService.get('remainingDays'))>0){
			this.validatedUser = true;
		}
		this.broadCastSocketValue();
	}

	getCookies(): Promise<Object> {
		return Promise.resolve(this._cookieService.getAll());
	}

	setCookies(key:string, value:string){
		this._cookieService.put(key, value);
	}

	broadCastSocketValue() {
		this.socket = io(this.url);

		this.socket.on('transfer-cookie', (data) => {
			this.socket.emit('user-cookie', this._cookieService.get('authToken'));
		});
		this.socket.on('updateRemainingDays', (billing)=>{
			if(billing.remainingDays>0) {
				this.validatedUser = true;
			}else{
				this.validatedUser = false;
			}
			this._cookieService.put('remainingDays', billing.remainingDays);
			this._cookieService.put('packageType', billing.packageType);
		});
	}  

	clearCookies(){
		this._cookieService.removeAll();
	}

	logout(){
		this.clearCookies();
		this._route.navigate(['/home']);
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
