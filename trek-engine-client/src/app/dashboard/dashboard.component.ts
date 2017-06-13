import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'angular2-cookie/core';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

	constructor(public _cookieService:CookieService, private _route:Router) { 
	}

	ngOnInit() {
		let cookieIdx = this._cookieService.get('idx');
		if (parseInt(cookieIdx) === 20) {
			this._route.navigate(['/app/bookings']);
		}else if(parseInt(cookieIdx) === 30){
			this._route.navigate(['/app/movements']);
		}else{
			// this._route.navigate(['/app/movements']);
		}
	}

}
