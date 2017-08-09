import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs/Observable';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Router } from '@angular/router';
import { AuthService } from './index';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';

@Injectable()
export class MovementsService {
	private observable: Observable<any>;
	constructor(public _cookieService:CookieService, private http: Http, private _route: Router, public authService:AuthService){}
	
	submitTripDetails(trip: Object) {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.post('/api/movements/trips/create', trip, options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	getTripDetails() {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.get('/api/movements/trips/findAll', options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	getTripDetail(tripQuery:any){
		let params: URLSearchParams = new URLSearchParams();
		for(let i=0;i<tripQuery.length;i++){
			let key = Object.keys(tripQuery[i])[0];
			let value = tripQuery[i][key];
			params.set(key, value);
		}
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers, search: params });
		return this.http.get('/api/movements/trips/findOne', options)
			.map(this.extractData)
			.catch(this.handleError);
	}

	filterTrek(filterQuery:any){
		let params: URLSearchParams = new URLSearchParams();
		for(let i=0;i<filterQuery.length;i++){
			let key = Object.keys(filterQuery[i])[0];
			let value = filterQuery[i][key];
			params.set(key, value);
		}
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers, search: params });
		return this.http.get('/api/movements/trips/filter', options)
			.map(this.extractData)
			.catch(this.handleError);
	}

	updateTrekDetails(trip: Object) {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.put('/api/movements/trips/update', trip, options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	deleteTrip(deleteId: string) {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken'), 'deleteId': deleteId});
    	let options = new RequestOptions({ headers: headers });
		return this.http.delete('/api/movements/trips/delete', options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	getBookings(){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken')});
    	let options = new RequestOptions({ headers: headers });
		return this.http.get('/api/movements/bookings/findAll', options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	getBooking(bookingQuery:any){
		let params: URLSearchParams = new URLSearchParams();
		for(let i=0;i<bookingQuery.length;i++){
			let key = Object.keys(bookingQuery[i])[0];
			let value = bookingQuery[i][key];
			params.set(key, value);
		}
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers, search: params });
		return this.http.get('/api/movements/bookings/findOne', options)
			.map(this.extractData)
			.catch(this.handleError);
	}

	deleteBooking(deleteId: string) {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken'), 'deleteId': deleteId});
    	let options = new RequestOptions({ headers: headers });
		return this.http.delete('/api/movements/bookings/delete', options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	submitBookingDetails(booking: Object):Promise<any> {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.post('/api/movements/bookings/create', booking, options)
			.toPromise()
			.then(this.extractData)
    		.catch(this.handleError.bind(this));
	}

	updateBookingDetails(booking:Object) {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.put('/api/movements/bookings/update', booking, options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	removeTraveler(updateObj:Object){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.put('/api/movements/bookings/removeTraveler', updateObj, options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	getFlightDetails() {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.get('/api/movements/flights/findAll', options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	getFlightDetailsByParams(queries:any){
		let params: URLSearchParams = new URLSearchParams();
		for(let i=0;i<queries.length;i++){
			let key = Object.keys(queries[i])[0];
			let value = queries[i][key];
			params.set(key, value);
		}
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers, search: params });
		return this.http.get('/api/movements/flights/findOne', options)
			.map(this.extractData)
			.catch(this.handleError);
	}

	submitFlightDetails(flight: Object) {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.post('/api/movements/flights/create', flight, options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	updateFlightDetails(flight:Object) {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.put('/api/movements/flights/update', flight, options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	deleteFlightDetails(deleteId: string) {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken'), 'deleteId': deleteId});
    	let options = new RequestOptions({ headers: headers });
		return this.http.delete('/api/movements/flights/delete', options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	getTravelerDetails() {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.get('/api/movements/traveler/findAll', options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	submitTravelerDetails(traveler:Object){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.post('/api/movements/traveler/add', traveler, options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	queryTravelerDetails(query:any){
		let params: URLSearchParams = new URLSearchParams();
		for(let i=0;i<query.length;i++){
			let key = Object.keys(query[i])[0];
			let value = query[i][key];
			params.set(key, value);
		}
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers, search: params });
		return this.http.get('/api/movements/traveler/query', options)
			.map(this.extractData)
			.catch(this.handleError);
	}

	updateTravelerDetails(traveler:Object) {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.put('/api/movements/traveler/update', traveler, options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	deleteTravelerDetails(deleteId: string) {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken'), 'deleteId': deleteId});
    	let options = new RequestOptions({ headers: headers });
		return this.http.delete('/api/movements/traveler/delete', options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	getAirportPickupsInfo() {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.get('/api/movements/traveler/getAirportPickupsInfo', options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}
	
	getUserTrekInfos(){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.get('/api/movements/tripinfos/findUserTripsData', options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	updateUserTrekInfos(tripInfo:object){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.put('/api/movements/tripinfos/updateUserTripsData', tripInfo, options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	createUserTripsData(tripInfo:object){
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken') });
    	let options = new RequestOptions({ headers: headers });
		return this.http.post('/api/movements/tripinfos/createUserTripsData', tripInfo, options)
            .map(this.extractData)
            .catch(this.handleError.bind(this));
	}

	deleteUserTrekInfos(deleteId: string) {
		let headers = new Headers({ 'Content-Type': 'application/json', 'token': this._cookieService.get('authToken'), 'deleteId': deleteId});
    	let options = new RequestOptions({ headers: headers });
		return this.http.delete('/api/movements/tripinfos/deleteUserTrekInfos', options)
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
