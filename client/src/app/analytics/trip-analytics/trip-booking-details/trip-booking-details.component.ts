import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnalyticsService } from '../../../services/index';
import { GoogleChartComponent } from '../../../google-chart/google-chart.component';
import { Pipe, PipeTransform } from '@angular/core';
import {IMyOptions, IMyDateModel} from 'mydatepicker';
import * as moment from 'moment';

@Component({
	selector: 'app-trip-booking-details',
	templateUrl: './trip-booking-details.component.html',
	styleUrls: ['./trip-booking-details.component.css']
})
export class TripBookingDetailsComponent implements OnInit{
	public analyticsErr: any;
	public tableData: any;
	public resultData: any;

	public pieData: any = [];
	public pie_ChartOptions:any;
	public columnChartData: any = [];
	public columnChartStackData: any = [];
	public column_ChartOptions:any;
	
	myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
        firstDayOfWeek: 'su',
        sunHighlight: false,
        editableDateField: false
    };
    analyticsStartDate: any;
	analyticsEndDate: any;

  	constructor(private route: ActivatedRoute, private analyticsService: AnalyticsService) { }

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

		this.getTrekBookingAnalyticsDetails(this.analyticsStartDate, this.analyticsEndDate);	    
  	}

  	getTrekBookingAnalyticsDetails(startDate, endDate){
  		this.route.params.subscribe(params => {
        	this.analyticsService.getTrekBookingAnalyticsDetails({tripInfoId:params.tripId, startDate: startDate, endDate: endDate})
             	.subscribe(analyticsDetails=>{
               		this.tableData = analyticsDetails.tableData;
               		if(analyticsDetails.result && analyticsDetails.result.length>0){
						this.resultData = analyticsDetails.result[0];
						let resultData = analyticsDetails.result[0];
						this.pieData.push( 
		   					{ category: 'Male', value: resultData.male },
			    			{ category: 'Female', value: resultData.female }
		    			);
		    			this.columnChartData.push(
							resultData['18-24'],
							resultData['25-34'],
							resultData['35-44'],
							resultData['45-54'],
							resultData['55-64'],
							resultData['65+']
						);
						this.columnChartStackData.push(
							resultData['18-24']>0?resultData.totalTraveler - resultData['18-24']:0,
							resultData['25-34']>0?resultData.totalTraveler - resultData['25-34']:0,
							resultData['35-44']>0?resultData.totalTraveler - resultData['35-44']:0,
							resultData['45-54']>0?resultData.totalTraveler - resultData['45-54']:0,
							resultData['55-64']>0?resultData.totalTraveler - resultData['55-64']:0,
							resultData['65+']>0?resultData.totalTraveler - resultData['65+']:0
						);;
					}
				}, analyticsErr=>{
					this.analyticsErr = analyticsErr;
				});
	    });
  	}

  	onCalendarToggle(event: number): void {
		if(event == 2){
			this.getTrekBookingAnalyticsDetails(this.analyticsStartDate, this.analyticsEndDate);
		}
  	}
}