import { Component, OnInit } from '@angular/core';
import { NotificationsService, AuthService } from '../services/index';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';
declare var jQuery:any;
import { environment } from '../../environments/environment';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
@Component({
  selector: '',
  providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
	cookieData:any;
	notifications: any;
	notificationErr: any;
	sideMenuArr:any;

	constructor(public _cookieService:CookieService, public authService: AuthService, private _route: Router, public notificationsService: NotificationsService, private location: Location){
		this.getUnreadNotifications();
	}
	
	ngOnInit(){
		this.cookieData = this._cookieService.getAll();
		jQuery(".dropdown-button").dropdown();
		jQuery(".button-collapse").sideNav({
			closeOnClick: true
		});

		if(this.cookieData && this.cookieData.idx && parseInt(this.cookieData.idx) === 20){
			this.sideMenuArr =[
				{
					menu: 'Movements',
					routePath: '/app/movements'
				},{
					menu: 'Bookings',
					routePath: '',
					submenu: [
						{
							menu: 'Trip Details',
							routePath: '/app/movements/trip-details'
						},{
							menu: 'Guide Details',
							routePath: '/app/movements/guide-details'
						},{
							menu: 'Flight Details',
							routePath: '/app/movements/flight-details'
						},{
							menu: 'Traveler Details',
							routePath: '/app/movements/traveller-details'
						},{
							menu: 'Traveler Pickup Details',
							routePath: '/app/movements/airport-pickup-details'
						}
					]
				},{
					menu: 'Analytics',
					routePath: '',
					subMenu: [
						{
							menu: 'Audience',
							routePath: '',
							subMenuChild: [
								{
									menu: 'Overview',
									routePath: '/app/analytics/audience/overview',
								},{
									menu: 'Age',
									routePath: '/app/analytics/audience/age-analytics',
								},{
									menu: 'Country',
									routePath: '/app/analytics/audience/country-analytics',
								},{
									menu: 'Gender',
									routePath: '/app/analytics/audience/gender-analytics',
								}
							]
						},{
							menu: 'Trip',
							routePath: '',
							subMenuChild: [
								{
									menu: 'Overview',
									routePath: '/app/analytics/trip/overview',
								},{
									menu: 'Trip Booking',
									routePath: '/app/analytics/trip/trip-booking-analytics',
								}
							]
						}
					]
				}
			];
		}
	}

	logout() {
		this._cookieService.removeAll();
		window.location.href = environment.webUrl+'/home';
	}

	dropDownNav(){
		jQuery(".dropdown-button").dropdown();
	}

	dropDownNotifications(){
		if(this.notifications.length>0){
			jQuery(".dropdown-notification").dropdown();
		}
	}

	openSideNav(){
		jQuery(".button-collapse").sideNav({
			closeOnClick: true
		});
	}

	getUnreadNotifications(){
		this.notificationsService.getUnreadNotifications()
			.subscribe(notifications=>{
				this.authService.notifications = notifications;
			}, error => {
				this.notificationErr = error;
			});
	}

	updateViewedNotification(notificaitonObj){
		notificaitonObj.viewed = true;
		this.notificationsService.updateNotificationData(notificaitonObj)
			.subscribe(notifications=>{
				if(this.location.path() === '/app/notifications'){
					location.reload();
				}else{
					this.getUnreadNotifications();
					this._route.navigate(['/app/notifications']);
				}
			}, error => {
				this.notificationErr = error;
			});
	}
}
