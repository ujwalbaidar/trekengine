import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../services/index';
import {IMyOptions, IMyDateModel} from 'mydatepicker';
import * as moment from 'moment';

@Component({
  selector: 'app-audience-overview',
  templateUrl: './audience-overview.component.html',
  styleUrls: ['./audience-overview.component.css']
})
export class AudienceOverviewComponent implements OnInit {
	public audienceAgeGenderGroups: any;
	public audienceCountryGroups: any;
	public overviewErr: any;

	public pieData: any;
	public columnChartData: any;
	public columnChartStackData: any;
	public overviewStartDate: any;
	public overViewEndDate: any;

	myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
        firstDayOfWeek: 'su',
        sunHighlight: false,
        editableDateField: false
    };

	constructor(public analyticsService: AnalyticsService) { }

	ngOnInit() {
		var startDate = moment().startOf('year').toDate();
		var endDate   = moment().endOf('year').toDate();
		
		this.overviewStartDate = {
			date: {
				year: startDate.getFullYear(),
				month: startDate.getMonth()+1,
				day: startDate.getDate()
			},
			epoc: Math.floor(startDate.getTime()/1000)
		};
		this.overViewEndDate = {
			date: {
				year: endDate.getFullYear(),
				month: endDate.getMonth()+1,
				day: endDate.getDate()
			},
			epoc: Math.floor(endDate.getTime()/1000)
		};

		this.getAudienceOverViewData({startDate: this.overviewStartDate, endDate: this.overViewEndDate});
	}

	getAudienceOverViewData(filterDate){
		this.analyticsService.getAudienceOverview(filterDate)
			.subscribe(overviewData=>{
					this.audienceAgeGenderGroups = overviewData[0];
					this.audienceCountryGroups = overviewData[1];
					if(overviewData[0]){
						let totalTraveler = overviewData[0]['count'];
						this.pieData = [];

		   				this.pieData.push( 
		   					{ category: 'Male', value: overviewData[0]['male'] },
			    			{ category: 'Female', value: overviewData[0]['female'] }
		    			);

		   				this.columnChartData = [];
		   				this.columnChartStackData = [];

		    			this.columnChartData.push(
							overviewData[0]['18-24'],
							overviewData[0]['25-34'],
							overviewData[0]['35-44'],
							overviewData[0]['45-54'],
							overviewData[0]['55-64'],
							overviewData[0]['65+']
						);

						this.columnChartStackData.push(
							overviewData[0]['18-24']>0?totalTraveler - overviewData[0]['18-24']:0,
							overviewData[0]['25-34']>0?totalTraveler - overviewData[0]['25-34']:0,
							overviewData[0]['35-44']>0?totalTraveler - overviewData[0]['35-44']:0,
							overviewData[0]['45-54']>0?totalTraveler - overviewData[0]['45-54']:0,
							overviewData[0]['55-64']>0?totalTraveler - overviewData[0]['55-64']:0,
							overviewData[0]['65+']>0?totalTraveler - overviewData[0]['65+']:0
						);
					}
			}, overviewDataErr=>{
				this.overviewErr = overviewDataErr;
			});
	}

	onCalendarToggle(event: number): void {
		this.getAudienceOverViewData({startDate: this.overviewStartDate, endDate: this.overViewEndDate});
  	}
}
