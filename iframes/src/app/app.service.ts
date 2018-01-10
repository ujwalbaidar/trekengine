import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs/Observable';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';

@Injectable()
export class AppService {

	constructor(private http: Http, private _cookieService: CookieService) { }

	getCountryLists(){
		let headers = new Headers({ 'Content-Type': 'application/json'});
    	let options = new RequestOptions({ headers: headers });
		return this.http.get(window.frameElement.getAttribute('src')+'/getCountryList', options)
			.map(this.extractData)
			.catch(this.handleError);
	}

	submitTravelerDetails(traveler:Object){
		let headers = new Headers({ 
			'Content-Type': 'application/json', 
			'webOrigin': window.location.origin, 
			'webHeader': JSON.stringify(this._cookieService.getAll())
		})
		let iframeSource = window.frameElement.getAttribute('src');
    	let options = new RequestOptions({ headers: headers });
		return this.http.post(iframeSource+'/create', traveler, options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}
	
	extractData(res: Response) {
    	let body = res.json();
    	return body.data || { };
    }

    private handleError (error: Response | any) {
    	if(error.status == 401){
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
