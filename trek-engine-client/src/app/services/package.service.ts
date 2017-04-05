import { Injectable } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';
import { Observable } from 'rxjs/Observable';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { AuthService } from './index';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';

@Injectable()
export class PackageService {
	private observable: Observable<any>;
	constructor(public _cookieService:CookieService, private http: Http, public authService:AuthService) { 

  	}
  	
  	getPackages(){
	  	var packages = [{
	  		packageName: 'Basic',
	  		packageValue: 'basic',
	  		packageDesc: 'Basic Trek Engine Features',
	  		cost: 50,
	  		validDays: 30,
	  		features: [
	  			'Business email through Gmail',
				'Video and voice conferencing',
				'Smart shared calendars',
				'Documents, spreadsheets, and presentations',
				'24/7 support by phone, email, and online',
				'Security and administration controls',
				'30GB cloud storage'
	  		]
	  	},{
	  		packageName: 'Business',
	  		packageValue: 'business',
	  		packageDesc: 'Business Trek Engine Features',
	  		cost: 100,
	  		validDays: 60,
	  		features: [
	  			'Business email through Gmail',
				'Video and voice conferencing',
				'Smart shared calendars',
				'Documents, spreadsheets, and presentations',
				'24/7 support by phone, email, and online',
				'Security and administration controls',
				'30GB cloud storage'
	  		]
	  	},{
	  		packageName: 'Enterprise',
	  		packageValue: 'enterprise',
	  		packageDesc: 'Enterprise Trek Engine Features',
	  		cost: 500,
	  		validDays: 90,
	  		features: [
	  			'Business email through Gmail',
				'Video and voice conferencing',
				'Smart shared calendars',
				'Documents, spreadsheets, and presentations',
				'24/7 support by phone, email, and online',
				'Security and administration controls',
				'30GB cloud storage'
	  		]
	  	}];
	  	return new Promise(resolve=>{
	  		resolve(packages);
	  	});
	}

	submitPackage(featurePackage:any){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.post('/api/packages/submit', featurePackage, options)
			.toPromise()
			.then(this.extractData)
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
