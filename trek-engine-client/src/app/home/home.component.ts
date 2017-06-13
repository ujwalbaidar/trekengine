import { Component, OnInit } from '@angular/core';
import { NotificationsService, AuthService } from '../services/index';
import { Router } from '@angular/router';
import { CookieService } from 'angular2-cookie/core';
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

	constructor(public _cookieService:CookieService, public authService: AuthService, private _route: Router, public notificationsService: NotificationsService, private location: Location){
		this.getUnreadNotifications();
	}
	ngOnInit(){
		this.cookieData = this._cookieService.getAll();
		jQuery(".dropdown-button").dropdown();
		jQuery(".button-collapse").sideNav({
			closeOnClick: true
		});
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
