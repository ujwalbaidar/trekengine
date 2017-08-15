import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { Router } from '@angular/router';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import * as io from "socket.io-client/dist/socket.io";
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthService {
	hrs:any[];
	mins: any[];
	public url = environment.webUrl;  
	// public url = 'https://www.trekengine.com';  
 	private socket;
 	public validatedUser = false;
 	private decodedData: object;
 	public notifications: any;

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
			this._cookieService.put('remainingDays', billing.remainingDays, {path:'/'});
			this._cookieService.put('packageType', billing.packageType, {path:'/'});
		});
		let email = this._cookieService.get('email')+'_notifications';
		this.socket.on(email, data =>{
			this.notifications.push(data);
		});
	}  

	clearCookies(){
		this._cookieService.removeAll();
	}

	logout(){
		this.clearCookies();
		this._route.navigate(['/home']);
	}

	validateToken(authToken:string){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': authToken });
    	let options = new RequestOptions({ headers: headers });
		return this.http.get('/trekengineApp/validateAuthToken', options)
            .map(this.extractData)
            .catch(err=>{
            	return err;
            });
	}

	validateAuthToken(token:string){
		return new Promise((resolve)=>{
			this.validateToken(token)
				.subscribe(resolvedData=>{
					if(resolvedData && JSON.stringify(resolvedData) !== "{}"){
						this.decodedData = resolvedData;
						resolve(true);
					}else{
						this._cookieService.removeAll();
						this._route.navigate(['/home']);
						resolve(false);
					}
				}, error=>{
					this._cookieService.removeAll();
					this._route.navigate(['/home']);
					resolve(false);
				});
		});
	}

	returnDecodedData(){
		return this.decodedData;
	}
	


	private extractData(res: Response) {
    	let body = res.json();
    	return body.data || { };
    }

	developTimePicker(){
		if(this.hrs === undefined){
			this.hrs = [];
			for(let i=0; i<24;i++){
				if(i<10){
					this.hrs.push('0'+i);
				}else{
					this.hrs.push(JSON.stringify(i));
				}
			}
		}

		if(this.mins === undefined){
					this.mins = [];
			for(let i=0; i<=55;i+=5){
				if(i<10){
					this.mins.push('0'+i);
				}else{
					this.mins.push(JSON.stringify(i));
				}
			}
		}
		let time = {hrs:this.hrs,mins:this.mins};
		return time;
	}
}
