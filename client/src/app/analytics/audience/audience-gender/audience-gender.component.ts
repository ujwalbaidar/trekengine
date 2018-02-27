import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../services/index';
import {IMyOptions, IMyDateModel} from 'mydatepicker';
import * as moment from 'moment';

@Component({
	selector: 'app-audience-gender',
	templateUrl: './audience-gender.component.html',
	styleUrls: ['./audience-gender.component.css']
})
export class AudienceGenderComponent implements OnInit {
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

	constructor(public analyticsService: AnalyticsService) { }

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
		this.getAudienceGenderAnalytics({startDate: this.analyticsStartDate, endDate: this.analyticsEndDate});
	}

	getAudienceGenderAnalytics(filterDate){
		this.analyticsService.getAudienceGenderAnalytics(filterDate)
			.subscribe(genderAnalyticData=>{
				this.analyticData = genderAnalyticData;
			}, genderAnalyticErr=>{
				this.analyticErr = genderAnalyticErr;
			});
	}

	onCalendarToggle(event: number): void {
		this.getAudienceGenderAnalytics({startDate: this.analyticsStartDate, endDate: this.analyticsEndDate});
  	}
}
