import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../services/index';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trip-booking',
  templateUrl: './trip-booking.component.html',
  styleUrls: ['./trip-booking.component.css']
})
export class TripBookingComponent implements OnInit {
	analyticsError:any;
	analyticsData: any;

	constructor(private analyticsService: AnalyticsService, private _route: Router) { }

	ngOnInit() {
		this.getTrekBookingAnalytics();
	}

	getTrekBookingAnalytics(){
		this.analyticsService.getTrekBookingAnalytics()
			.subscribe(bookingAnalyticsData=>{
				this.analyticsData = bookingAnalyticsData;
			}, error=>{
				this.analyticsError = error;
			});
	}

	redirectDetails(tripInfo){
		let tripId = tripInfo._id;
		this._route.navigate(['/app/analytics/trip/trip-booking/details',tripId]);
	}
}
