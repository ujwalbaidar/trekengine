import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../services/index';

@Component({
  selector: 'app-audience-country',
  templateUrl: './audience-country.component.html',
  styleUrls: ['./audience-country.component.css']
})
export class AudienceCountryComponent implements OnInit {
	analyticData: any;
	analyticErr: any;

	constructor(public analyticsService:AnalyticsService) { }

	ngOnInit() {
		this.getAudienceCountryAnalytics();
	}

	getAudienceCountryAnalytics(){
		this.analyticsService.getAudienceCountryAnalytics()
			.subscribe(analyticsData=>{
				this.analyticData = analyticsData;
			}, analyticsError=>{
				this.analyticErr = analyticsError;
			});
	}
}
