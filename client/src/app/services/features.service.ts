import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs/Observable';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { AuthService } from './index';

@Injectable()
export class FeaturesService {
	private observable: Observable<any>;
	constructor(
		public _cookieService:CookieService, 
		private http: Http, 
		public authService:AuthService
	){}
	
	getAppFeature(){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.get('/api/features/getAll', options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	submitAppFeature(feature:Object){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.post('/api/features/submit', feature, options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	updateAppFeature(feature: Object) {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.put('/api/features/update', feature, options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	deleteAppFeture(deleteId: string) {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken'), 'deleteId': deleteId});
    	let options = new RequestOptions({ headers: headers });
		return this.http.delete('/api/features/delete', options)
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
