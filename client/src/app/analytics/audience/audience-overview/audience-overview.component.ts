import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../services/index';

@Component({
  selector: 'app-audience-overview',
  templateUrl: './audience-overview.component.html',
  styleUrls: ['./audience-overview.component.css']
})
export class AudienceOverviewComponent implements OnInit {
	public audienceAgeGenderGroups: any;
	public audienceCountryGroups: any;
	public overviewErr: any;
	public pie_ChartData: any = [];
	public pie_ChartOptions:any;
	public column_ChartData: any = [];
	public column_ChartOptions:any;

	constructor(public analyticsService: AnalyticsService) { }

	ngOnInit() {
		this.getAudienceOverViewData();
	}

	getAudienceOverViewData(){
		this.analyticsService.getAudienceOverview()
			.subscribe(overviewData=>{
				if(overviewData[0] === undefined && overviewData[1] === undefined){
					this.audienceAgeGenderGroups = overviewData[0];
					this.audienceCountryGroups = overviewData[1];
					let totalTraveler = overviewData[0]['count'];
					if(overviewData[0]['male']){
						var maleCount = overviewData[0]['male'];
						var maleCountPercent = (maleCount/totalTraveler)*100;
					}

					if(overviewData[0]['female']){
						var femaleCount = overviewData[0]['female'];
						var femaleCountPercent = (femaleCount/totalTraveler)*100;
					}

					this.pie_ChartData.push(
						['Gender', 'Traveler'],
					    ['Male', maleCountPercent],
					    ['Female', femaleCountPercent]
				    );
	   				this.pie_ChartOptions = {
	   					title: 'Gender Audience Pie chart',
					    width: 900,
					    height: 500
	   				};

	   				this.column_ChartData.push(
				        ["Age", "Total Traveler", { role: "style" }],
						["18-24", ((overviewData[0]['18-24'])/totalTraveler)*100, "#6495ED"],
						["25-34", ((overviewData[0]['25-34'])/totalTraveler)*100, "#6495ED"],
						["35-44", ((overviewData[0]['35-44'])/totalTraveler)*100, "#6495ED"],
						["45-54", ((overviewData[0]['45-54'])/totalTraveler)*100, "#6495ED"],
						["55-64", ((overviewData[0]['55-64'])/totalTraveler)*100, "#6495ED"],
						["65+", ((overviewData[0]['65+'])/totalTraveler)*100, "#6495ED"]
			      	);

	   				this.column_ChartOptions = {
	   					title: "Audience Age Overview",
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
			}, overviewDataErr=>{
				this.overviewErr = overviewDataErr;
			});
	}
}
