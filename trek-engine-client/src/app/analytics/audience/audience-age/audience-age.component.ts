import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../services/index';

@Component({
  selector: 'app-audience-age',
  templateUrl: './audience-age.component.html',
  styleUrls: ['./audience-age.component.css']
})
export class AudienceAgeComponent implements OnInit {
	public ageAnalyticsErr: any;
	public ageAnalyticsData: any;

	constructor(public analyticsService: AnalyticsService) { }

	ngOnInit() {
		this.getAudienceAgeAnalytics();
	}

	getAudienceAgeAnalytics(){
		this.analyticsService.getAudienceAgeAnalytics()
			.subscribe(ageAnalyticsData=>{
				this.ageAnalyticsData = ageAnalyticsData;
			}, ageAnalyticsDataErr=>{
				this.ageAnalyticsErr = ageAnalyticsDataErr;
			});
	}
}
