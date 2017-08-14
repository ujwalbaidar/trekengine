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
	active: string;

	constructor(public _cookieService:CookieService, public authService: AuthService, private _route: Router, public notificationsService: NotificationsService, private location: Location){
		this.getUnreadNotifications();
	}
	
	ngOnInit(){
		this.cookieData = this._cookieService.getAll();
		jQuery(".dropdown-button").dropdown();
		jQuery(".button-collapse").sideNav({
			closeOnClick: true
		});
		jQuery(".collapsible").collapsible();
		if(this.cookieData && this.cookieData.idx && parseInt(this.cookieData.idx) === 20){
			this.sideMenuArr =[
				{
					menu: 'Movements',
					routePath: '/app/movements',
					iconName: 'fa fa-home',
					status: true,
				},{
					menu: 'Bookings',
					iconName: 'fa fa-book',
					status: true,
					subMenu: [
						{
							menu: 'Trip Details',
							routePath: '/app/movements/trip-details',
							iconName: 'fa fa-calendar-o'
						},{
							menu: 'Guide Details',
							routePath: '/app/movements/guide-details',
							iconName: 'fa fa-book'
						},{
							menu: 'Flight Details',
							routePath: '/app/movements/flight-details',
							iconName: 'fa fa-plane'
						},{
							menu: 'Traveler Details',
							routePath: '/app/movements/traveller-details',
							iconName: 'fa fa-car'
						},{
							menu: 'Traveler Pickup Details',
							routePath: '/app/movements/airport-pickup-details',
							iconName: 'fa fa-car'
						}
					]
				}/*,{
					menu: 'Analytics',
					status: false,
					subMenu: [
						{
							menu: 'Audience',
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
							subMenuChild: [
								{
									menu: 'Overview',
									routePath: '/app/analytics/trip/overview',
								},{
									menu: 'Trip Booking',
									routePath: '/app/analytics/trip/trip-booking',
								}
							]
						}
					]
				}*/
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

	collapseSideMenu(){
		let bodyClassList = document.getElementsByTagName('body')[0].classList;
		if(bodyClassList.contains('collapse-menu')){
			bodyClassList.remove('collapse-menu');
		}else{
			bodyClassList.add('collapse-menu');
		}
	}

	redirectSidemenu(path, level){
		if(path !== undefined){
			this._route.navigate([path]);
		}else{
			jQuery('.collapsible').collapsible();
		}
	}
}
