import { Injectable } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';
import { Observable } from 'rxjs/Observable';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

@Injectable()
export class MovementsService {
	constructor(public _cookieService:CookieService, private http: Http){}
	
	submitTripDetails(trip: Object){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.post('/api/movements/trips/create', trip, options)
			.share()
            .map(this.extractData)
            .catch(this.handleError);
	}

	getTripDetails() {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.get('/api/movements/trips/findAll', options)
			.share()
            .map(this.extractData)
            .catch(this.handleError);
	}

	updateTrekDetails(trip: Object){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.put('/api/movements/trips/update', trip, options)
			.share()
            .map(this.extractData)
            .catch(this.handleError);
	}

	deleteTrip(deleteId: string) {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken'), 'deleteId': deleteId});
    	let options = new RequestOptions({ headers: headers });
		return this.http.delete('/api/movements/trips/delete', options)
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