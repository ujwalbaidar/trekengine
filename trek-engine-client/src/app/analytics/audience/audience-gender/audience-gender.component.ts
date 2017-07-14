import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../services/index';

@Component({
	selector: 'app-audience-gender',
	templateUrl: './audience-gender.component.html',
	styleUrls: ['./audience-gender.component.css']
})
export class AudienceGenderComponent implements OnInit {
	analyticData: any;
	analyticErr: any;

	constructor(public analyticsService: AnalyticsService) { }

	ngOnInit() {
		this.getAudienceGenderAnalytics();
	}

	getAudienceGenderAnalytics(){
		this.analyticsService.getAudienceGenderAnalytics()
			.subscribe(genderAnalyticData=>{
				this.analyticData = genderAnalyticData;
			}, genderAnalyticErr=>{
				this.analyticErr = genderAnalyticErr;
			});
	}
}
