import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/index';
import { Router } from '@angular/router';

@Component({
  selector: 'movements',
  templateUrl: './movements.component.html',
  styleUrls: ['./movements.component.css']
})
export class MovementsComponent implements OnInit {
	public sideMenuArr:any;
	constructor(private authService: AuthService, private _route: Router){
	}

	ngOnInit(){
		this.authService.getCookies().then(cookiesData=>{
			if(parseInt(cookiesData['idx']) === 20){
				this.sideMenuArr = [
					{
						menu: 'Movement Details',
						routePath: '/app/movements'
					},{
						menu: 'Guide Details',
						routePath: '/app/movements/guide-details'
					},{
						menu: 'Trip Details',
						routePath: '/app/movements/trip-details'
					},{
						menu: 'Traveler Details',
						routePath: '/app/movements/traveller-details'
					},{
						menu: 'Flight Details',
						routePath: '/app/movements/flight-details'
					},{
						menu: 'Traveler Pickup Details',
						routePath: '/app/movements/airport-pickup-details'
					}
				];
			}
		});
	}
}
