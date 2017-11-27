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

	public pieData: any = [];
	public columnChartData: any = [];
	public columnChartStackData: any = [];
	
	constructor(public analyticsService: AnalyticsService) { }

	ngOnInit() {
		this.getAudienceOverViewData();
	}

	getAudienceOverViewData(){
		this.analyticsService.getAudienceOverview()
			.subscribe(overviewData=>{
					this.audienceAgeGenderGroups = overviewData[0];
					this.audienceCountryGroups = overviewData[1];
					if(overviewData[0]){
						let totalTraveler = overviewData[0]['count'];

		   				this.pieData.push( 
		   					{ category: 'Male', value: overviewData[0]['male'] },
			    			{ category: 'Female', value: overviewData[0]['female'] }
		    			);

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
}
