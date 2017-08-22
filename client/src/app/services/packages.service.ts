import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs/Observable';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { AuthService } from './auth.service';

@Injectable()
export class PackagesService {
	private observable: Observable<any>;
	constructor(
		public _cookieService:CookieService, 
		private http: Http, 
		public authService:AuthService
	){}
	
	getAppPackage(){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.get('/api/packages/getAll', options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	getAppPackageDetail(packageQuery:any){
		let params: URLSearchParams = new URLSearchParams();
		for(let i=0;i<packageQuery.length;i++){
			let key = Object.keys(packageQuery[i])[0];
			let value = packageQuery[i][key];
			params.set(key, value);
		}
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers, search: params });
		return this.http.get('/api/packages/byQuery', options)
			.map(this.extractData)
			.catch(this.handleError);
	}

	submitAppPackage(appPackage:Object){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.post('/api/packages/submit', appPackage, options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	updateAppPackage(appPackage: Object) {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.put('/api/packages/update', appPackage, options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	deleteAppPackage(deleteId: string) {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken'), 'deleteId': deleteId});
    	let options = new RequestOptions({ headers: headers });
		return this.http.delete('/api/packages/delete', options)
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
