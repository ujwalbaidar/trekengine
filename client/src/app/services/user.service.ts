import { Injectable } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';
import { Http, Response }          from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

@Injectable()
export class UserService {
	constructor(public _cookieService:CookieService, private http: Http){}
	
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

	private extractData(res: Response) {
    	let body = res.json();
    	return body.data || { };
    }

    private handleError (error: Response | any) {
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