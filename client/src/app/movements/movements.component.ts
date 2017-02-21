import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/index';
import { Router } from '@angular/router';

@Component({
    selector: 'movements',
    templateUrl: './src/app/movements/movements.component.html'
})
export class MovementComponent implements OnInit {
	public sideMenuArr:any = [
		{
			menu: 'Bookings',
			routePath: ''
		},{
			menu: 'Trip Details',
			routePath: '/movements/trip-details'
		},{
			menu: 'Traveler Details',
			routePath: ''
		}
	];
	constructor(private authService: AuthService, private _route: Router){}
	ngOnInit(){}
}