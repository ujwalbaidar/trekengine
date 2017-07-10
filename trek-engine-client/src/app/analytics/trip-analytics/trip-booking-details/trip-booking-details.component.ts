import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnalyticsService } from '../../../services/index';
import { GoogleChartComponent } from '../../../google-chart/google-chart.component';
import { Pipe, PipeTransform } from '@angular/core';

@Component({
  selector: 'app-trip-booking-details',
  templateUrl: './trip-booking-details.component.html',
  styleUrls: ['./trip-booking-details.component.css']
})
export class TripBookingDetailsComponent implements OnInit{
	tripInfoId: String;
	analyticsErr: any;
	analyticsData: any;
	groupData: any;

	public pie_ChartData: any = [];
  	public pie_ChartOptions:any;
  	public countryAnalyticData: any;
  	public countries: any;

	constructor(private route: ActivatedRoute, private analyticsService: AnalyticsService) { }

	ngOnInit() {
		this.route.params.subscribe(params => {
       		this.tripInfoId = params.tripId;
       		this.analyticsService.getTrekBookingAnalyticsDetails([{tripInfoId:params.tripId}])
       			.subscribe(analyticsDetails=>{
       				this.analyticsData = analyticsDetails.analyticsData[0];
       				this.groupData = analyticsDetails.groupData;
       				this.pie_ChartData.push(['Task', 'Hours per Day'],
					    ['Male', 60],
					    ['Female', 40]
				    );
       				this.pie_ChartOptions = {
       					title: 'Traveler Pie chart',
					    width: 900,
					    height: 500
       				};
       				if(analyticsDetails.groupData && analyticsDetails.groupData.country){
       					this.countryAnalyticData = analyticsDetails.groupData.country;
       					this.countries = Object.keys(analyticsDetails.groupData.country);
       				}
       			}, analyticsErr=>{
       				this.analyticsErr = analyticsErr;
       			});
		});
	}

}

