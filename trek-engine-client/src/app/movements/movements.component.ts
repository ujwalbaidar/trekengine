import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/index';
import { Router } from '@angular/router';

@Component({
  selector: 'movements',
  templateUrl: './movements.component.html',
  styleUrls: ['./movements.component.css']
})
export class MovementsComponent implements OnInit {
	public sideMenuArr:any = [
		{
			menu: 'Movement Details',
			routePath: '/movements/movement-details'
		},
		{
			menu: 'Bookings',
			routePath: '/movements/bookings'
		},{
			menu: 'Guide Details',
			routePath: '/movements/guide-details'
		},{
			menu: 'Trip Details',
			routePath: '/movements/trip-details'
		},{
			menu: 'Traveler Details',
			routePath: '/movements/traveller-details'
		},{
			menu: 'Flight Details',
			routePath: '/movements/flight-details'
		}
	];
	constructor(private authService: AuthService, private _route: Router){}
	ngOnInit(){}
}
