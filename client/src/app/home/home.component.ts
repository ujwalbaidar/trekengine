import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NotificationsService, AuthService } from '../services/index';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';
declare var jQuery:any;
import { environment } from '../../environments/environment';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { MdDialog, MdDialogRef } from '@angular/material';
import { BookingsDialogComponent } from '../movements/bookings/bookings.component';

@Component({
  selector: '',
  providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
	cookieData:any;
	notifications: any;
	notificationErr: any;
	sideMenuArr:any;
	active: string;

	constructor(
		public _cookieService:CookieService, 
		public authService: AuthService, 
		private _route: Router, 
		public notificationsService: NotificationsService, 
		private location: Location, 
		public dialog: MdDialog
	){
		this.getUnreadNotifications();
	}
	
	ngOnInit(){
		this.cookieData = this._cookieService.getAll();

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
							menu: 'All Bookings',
							routePath: '/app/bookings',
							iconName: 'fa fa-book'
						},
						{
							menu: 'Add New Booking',
							routePath: '/app/movements/trip-details',
							iconName: 'fa fa-book',
							openModal: true,
							modalFunction: 'openAddBookingModal'
						},
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
				},{
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
									routePath: '/app/analytics/audience/age',
								},{
									menu: 'Country',
									routePath: '/app/analytics/audience/country',
								},{
									menu: 'Gender',
									routePath: '/app/analytics/audience/gender',
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
				}
			];
		}
	}

	ngAfterViewInit() {
		jQuery(".dropdown-button").dropdown();
		jQuery(".dropdown-bookings").dropdown();
	}

	logout() {
		this._cookieService.removeAll();
		window.location.href = environment.webUrl+'/login';
	}

	dropDownNav(){
		jQuery(".dropdown-button").dropdown();
	}

	dropDownBookingsTab(){
		jQuery(".dropdown-bookings").dropdown();
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

	redirectSidemenu(path, level, openModal, modalFunction){
		if(openModal !== undefined && modalFunction !== undefined){
			this[modalFunction]();
		}else{
			if(path !== undefined){
				this._route.navigate([path]);
			}else{
				jQuery('.collapsible').collapsible();
			}
		}

	}

	openAddBookingModal(){
		let dialogOptions = {
  			width: '600px',
  			position: 'center',
  			disableClose: true
		};

		dialogOptions["data"] = {};

		let dialogRef = this.dialog.open(BookingsDialogComponent, dialogOptions);
		dialogRef.afterClosed().subscribe(result => {
			if(result !== 'opt-cancel'){
				this._route.navigate(['/app/bookings/booking-details/'+result.bookingId]);
			}
    	});
	}
}
