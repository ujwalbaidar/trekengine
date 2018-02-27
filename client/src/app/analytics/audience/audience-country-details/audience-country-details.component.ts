import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../services/index';
import { ActivatedRoute } from '@angular/router';
import {IMyOptions, IMyDateModel} from 'mydatepicker';
import * as moment from 'moment';

@Component({
	selector: 'app-audience-country-details',
	templateUrl: './audience-country-details.component.html',
	styleUrls: ['./audience-country-details.component.css']
})
export class AudienceCountryDetailsComponent implements OnInit {
	public countryName: String;
	public countryDetailData: any;
	public countryDetailError: any;

	myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
        firstDayOfWeek: 'su',
        sunHighlight: false,
        editableDateField: false
    };
    analyticsStartDate: any;
	analyticsEndDate: any;

	constructor(public analyticsService: AnalyticsService, private route: ActivatedRoute) { }

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
		this.route.params.subscribe(params => {
			this.countryName = params.countryName;
		});
		this.getAudienceCountryAnalytics(this.analyticsStartDate, this.analyticsEndDate);
	}

	getAudienceCountryAnalytics(startDate, endDate){
		this.analyticsService.getAudienceByCountryDetails({ countryName: this.countryName, startDate: startDate, endDate: endDate })
			.subscribe(countryDetailData=>{
				this.countryDetailData = countryDetailData;
			}, countryDetailError=>{
				this.countryDetailError = countryDetailError;
			});
	}

	onCalendarToggle(event: number): void {
		this.getAudienceCountryAnalytics(this.analyticsStartDate, this.analyticsEndDate);
  	}
}
