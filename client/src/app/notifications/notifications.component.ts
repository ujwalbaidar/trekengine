import { Component, OnInit } from '@angular/core';
import { NotificationsService } from '../services/';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
	public notifications;
	public notificationErr;
	constructor(public notificationsService:NotificationsService, public snackBar: MatSnackBar) { }

	ngOnInit() {
		this.getNotifications();
	}

	getNotifications(){
		this.notificationsService.getUserNotifications()
			.subscribe(notifications=>{
				this.notifications = notifications;
			}, error => {
				this.notificationErr = error;
			});
	}

	submitNotification(response:boolean, notification: object){
		this.notificationsService.submitResponse({notification:notification, acceptance:response})
			.subscribe(submitResponse=>{
				this.getNotifications();
			}, error => {
				this.notificationErr = error;
			});
	}
}
