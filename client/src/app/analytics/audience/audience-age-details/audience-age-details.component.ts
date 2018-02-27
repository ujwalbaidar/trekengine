import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnalyticsService } from '../../../services/index';
import {IMyOptions, IMyDateModel} from 'mydatepicker';
import * as moment from 'moment';

@Component({
	selector: 'app-audience-age-details',
	templateUrl: './audience-age-details.component.html',
	styleUrls: ['./audience-age-details.component.css']
})
export class AudienceAgeDetailsComponent implements OnInit {
	public minAge: String;
	public maxAge: String;

	public ageDetailData: any;
	public ageDetailError: any;

	myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
        firstDayOfWeek: 'su',
        sunHighlight: false,
        editableDateField: false
    };
    analyticsStartDate: any;
	analyticsEndDate: any;

	constructor(private route: ActivatedRoute, public analyticsService: AnalyticsService) { }

	ngOnInit() {
		this.route.params.subscribe(params => {
			this.minAge = params.minAge;
			this.maxAge = params.maxAge;
		});
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
		this.getAudienceAgeAnalytics(this.analyticsStartDate, this.analyticsEndDate);
	}

	getAudienceAgeAnalytics(startDate, endDate){
		this.analyticsService.getAudienceByAgeDetails({ minAge: this.minAge, maxAge: this.maxAge, startDate: startDate, endDate: endDate })
			.subscribe(ageDetailData=>{
				this.ageDetailData = ageDetailData;
			}, ageDetailError=>{
				this.ageDetailError = ageDetailError;
			});
	}

	onCalendarToggle(event: number): void {
		this.getAudienceAgeAnalytics(this.analyticsStartDate, this.analyticsEndDate);
  	}
}
