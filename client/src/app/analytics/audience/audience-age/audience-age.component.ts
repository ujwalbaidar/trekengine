import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../services/index';
import { Router } from '@angular/router';
import {IMyOptions, IMyDateModel} from 'mydatepicker';
import * as moment from 'moment';

@Component({
  selector: 'app-audience-age',
  templateUrl: './audience-age.component.html',
  styleUrls: ['./audience-age.component.css']
})
export class AudienceAgeComponent implements OnInit {
	public ageAnalyticsErr: any;
	public ageAnalyticsData: any;
	myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
        firstDayOfWeek: 'su',
        sunHighlight: false,
        editableDateField: false
    };
    analyticsStartDate: any;
	analyticsEndDate: any;

	constructor(public analyticsService: AnalyticsService, private _route: Router) { }

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
		this.getAudienceAgeAnalytics({startDate: this.analyticsStartDate, endDate: this.analyticsEndDate});
	}

	getAudienceAgeAnalytics(filterDate){
		this.analyticsService.getAudienceAgeAnalytics(filterDate)
			.subscribe(ageAnalyticsData=>{
				this.ageAnalyticsData = ageAnalyticsData;
			}, ageAnalyticsDataErr=>{
				this.ageAnalyticsErr = ageAnalyticsDataErr;
			});
	}

	navigateToAgeDetails(ageGroup:String){
		if(ageGroup.includes('-') === true){
			let splitAge = ageGroup.split("-");
			let minAge = splitAge[0];
			let maxAge = splitAge[1];
			let navigateUrl = ['/app/analytics/audience/age-details', 'minAge', minAge, 'maxAge', maxAge];
			this._route.navigate(navigateUrl);
		}else{
			let splitAge = ageGroup.split("+");
			let minAge = splitAge[0];
			let navigateUrl = ['/app/analytics/audience/age-details', 'minAge', minAge];
			this._route.navigate(navigateUrl);
		}
	}

	onCalendarToggle(event: number): void {
		this.getAudienceAgeAnalytics({startDate: this.analyticsStartDate, endDate: this.analyticsEndDate});
  	}
}
