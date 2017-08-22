import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs/Observable';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { AuthService } from './auth.service';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';

@Injectable()
export class PackageBillingsService {
	private observable: Observable<any>;
	constructor(public _cookieService:CookieService, private http: Http, public authService:AuthService) { 

  	}
  	
  	getPackages(){
  		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.get('/trekEngineApp/package-billings', options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	submitPackage(featurePackage:any){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.post('/api/package-billings/submit', featurePackage, options)
			.map(this.extractData)
    		.catch(this.handleError.bind(this));
	}

	updateAppPackage(packageBilling: Object) {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.put('/trekEngineApp/package-billings', packageBilling, options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	getUserBillings(){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.get('/api/package-billings/getAll', options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	queryUserBillings(billingQuery:any){
		let params: URLSearchParams = new URLSearchParams();
		for(let i=0;i<billingQuery.length;i++){
			let key = Object.keys(billingQuery[i])[0];
			let value = billingQuery[i][key];
			params.set(key, value);
		}
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers, search: params });
		return this.http.get('/api/auth/package-billings/queryUserBilling', options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	updateBillingDetails(billingData: any){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.put('/api/auth/package-billings/updateUserBilling', billingData, options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	updateBillPayment(packageBilling: Object) {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.put('/api/package-billings//updateBillPayment', packageBilling, options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	private extractData(res: Response) {
    	let body = res.json();
    	return body.data || { };
    }

    private handleError (error: Response | any) {
    	if(error.status == 401){
    		this.authService.logout();
			return Observable.of([]);
    	}else{
	    	let body: any;
			let errMsg: string;
			if (error instanceof Response) {
				body = error.json() || '';
				const err = body.error || JSON.stringify(body);
				errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
			} else {
				errMsg = error.message ? error.message : error.toString();
			}
			return Observable.throw({errMsg:errMsg, errBody: body});
    	}
	}
}
