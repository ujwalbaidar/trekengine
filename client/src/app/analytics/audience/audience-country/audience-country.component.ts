import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../services/index';
import { Router } from '@angular/router';
import {IMyOptions, IMyDateModel} from 'mydatepicker';
import * as moment from 'moment';

@Component({
  selector: 'app-audience-country',
  templateUrl: './audience-country.component.html',
  styleUrls: ['./audience-country.component.css']
})
export class AudienceCountryComponent implements OnInit {
	analyticData: any;
	analyticErr: any;
	myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
        firstDayOfWeek: 'su',
        sunHighlight: false,
        editableDateField: false
    };
    analyticsStartDate: any;
	analyticsEndDate: any;

	constructor(public analyticsService:AnalyticsService, private _route: Router) { }

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
		this.getAudienceCountryAnalytics({startDate: this.analyticsStartDate, endDate: this.analyticsEndDate});
	}

	getAudienceCountryAnalytics(filterDate){
		this.analyticsService.getAudienceCountryAnalytics(filterDate)
			.subscribe(analyticsData=>{
				this.analyticData = analyticsData;
			}, analyticsError=>{
				this.analyticErr = analyticsError;
			});
	}

	navigateCountryDetails(countryName:String){
		let navigateUrl = ['/app/analytics/audience/country-details', 'countryName', countryName];
		this._route.navigate(navigateUrl);
	}

	onCalendarToggle(event: number): void {
		this.getAudienceCountryAnalytics({startDate: this.analyticsStartDate, endDate: this.analyticsEndDate});
  	}
}
