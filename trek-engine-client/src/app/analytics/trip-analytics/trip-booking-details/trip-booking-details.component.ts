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
	public analyticsErr: any;
	public tableData: any;
	public resultData: any;

	public pie_ChartData: any = [];
	public pie_ChartOptions:any;
	public column_ChartData: any = [];
	public column_ChartOptions:any;

  	constructor(private route: ActivatedRoute, private analyticsService: AnalyticsService) { }

  	ngOnInit() {
	    this.route.params.subscribe(params => {
	        	this.analyticsService.getTrekBookingAnalyticsDetails([{tripInfoId:params.tripId}])
	             	.subscribe(analyticsDetails=>{
	               		this.tableData = analyticsDetails.tableData;
	               		if(analyticsDetails.result && analyticsDetails.result.length>0){
							let resultData = analyticsDetails.result[0];
							this.resultData = resultData;
							this.pie_ChartData.push(
								['Gender', 'Gender Percentage'],
								['Male', (resultData.male/resultData.totalTraveler)*100],
								['Female', (resultData.female/resultData.totalTraveler)*100]
							);

							this.pie_ChartOptions = {
								title: 'Traveler Pie chart',
								width: 900,
								height: 500
							};

							this.column_ChartData.push(
								["Age", "Total Traveler", { role: "style" }],
								["18-24", ((resultData['18-24'])/resultData['totalTraveler'])*100, "#6495ED"],
								["25-34", ((resultData['25-34'])/resultData['totalTraveler'])*100, "#6495ED"],
								["35-44", ((resultData['35-44'])/resultData['totalTraveler'])*100, "#6495ED"],
								["45-54", ((resultData['45-54'])/resultData['totalTraveler'])*100, "#6495ED"],
								["55-64", ((resultData['55-64'])/resultData['totalTraveler'])*100, "#6495ED"],
								["65+", ((resultData['65+'])/resultData['totalTraveler'])*100, "#6495ED"]
							);

							this.column_ChartOptions = {
								title: "Trip Details Age Group Chart",
								width: 600,
								height: 400,
								bar: {groupWidth: "95%"},
								legend: { position: "none" },
								vAxis: {
									minValue: 0,
									maxValue: 100,
									format: '#\'%\''
								},
							};
						}
	             }, analyticsErr=>{
	               this.analyticsErr = analyticsErr;
	             });
	    });
  	}
}