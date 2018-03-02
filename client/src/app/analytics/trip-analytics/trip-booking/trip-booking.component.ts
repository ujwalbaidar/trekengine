import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../services/index';
import { Router } from '@angular/router';
import {IMyOptions, IMyDateModel} from 'mydatepicker';
import * as moment from 'moment';

@Component({
  selector: 'app-trip-booking',
  templateUrl: './trip-booking.component.html',
  styleUrls: ['./trip-booking.component.css']
})
export class TripBookingComponent implements OnInit {
	analyticsError:any;
	analyticsData: any;
	myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
        firstDayOfWeek: 'su',
        sunHighlight: false,
        editableDateField: false
    };
    analyticsStartDate: any;
	analyticsEndDate: any;

	constructor(private analyticsService: AnalyticsService, private _route: Router) { }

	ngOnInit() {
		var startDate = moment().startOf('year').toDate();
		var endDate   = moment().endOf('year').toDate();
		
		this.analyticsStartDate = {
			date: {
				year: startDate.getFullYear(),
				month: startDate.getMonth()+1,
				day: startDate.getDate()
			},
			epoc: Math.floor(startDate.getTime()/1000)
		};
		this.analyticsEndDate = {
			date: {
				year: endDate.getFullYear(),
				month: endDate.getMonth()+1,
				day: endDate.getDate()
			},
			epoc: Math.floor(endDate.getTime()/1000)
		};
		this.getTrekBookingAnalytics({startDate: this.analyticsStartDate, endDate: this.analyticsEndDate});
	}

	getTrekBookingAnalytics(filterDate){
		this.analyticsService.getTrekBookingAnalytics(filterDate)
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

	onCalendarToggle(event: number): void {
		if(event == 2){
			this.getTrekBookingAnalytics({startDate: this.analyticsStartDate, endDate: this.analyticsEndDate});
		}
  	}
}
