import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs/Observable';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { AuthService } from './index';

@Injectable()
export class AnalyticsService {
	private observable: Observable<any>;
	constructor(
		public _cookieService:CookieService, 
		private http: Http, 
		public authService:AuthService
	) {}

	getTrekOverview(){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.get('/api/analytics/trek/overview', options)
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