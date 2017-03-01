import { Injectable } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';
import { Http, Response, URLSearchParams, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './index';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

@Injectable()
export class UserService {
	constructor(public _cookieService:CookieService, private http: Http, private authService: AuthService){}
	registerUser(users: Object){
		return this.http.post('/api/users/create', users)
            .map(this.extractData)
            .catch(this.handleError);
	}

	loginUser(users: Object){
		return this.http.post('/api/users/login', users)
            .map(this.extractData)
            .catch(this.handleError);
	}

	queryUser(queries:any){
		let params: URLSearchParams = new URLSearchParams();
		for(let i=0;i<queries.length;i++){
			let key = Object.keys(queries[i])[0];
			let value = queries[i][key];
			params.set(key, value);
		}
		return this.http.get('/api/users/findOne', {search: params})
			.map(this.extractData)
			.catch(this.handleError);
	}

	getGuides(){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.get('/api/guides/listByAdmin', options)
			.map(this.extractData)
			.catch(this.handleError);
	}
	
	updateUser(userObj: Object, queryParams:string){
		let params: URLSearchParams = new URLSearchParams();
		params.set('email', queryParams);
		return this.http.put('/api/users/update', userObj, {search: params})
			.share()
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	updateVendors(userData: Object){
		return this.http.post('/api/users/updateVendors', userData)
            .map(this.extractData)
            .catch(this.handleError);
	}

	removeUserFromList(userEmail: string, approverEmail: string){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken'), guide: userEmail, approver: approverEmail });
    	let options = new RequestOptions({ headers: headers });
		return this.http.delete('/api/guides/remove', options)
			.map(this.extractData)
			.catch(this.handleError);
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