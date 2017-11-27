import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../services/index';
import { Router } from '@angular/router';

@Component({
  selector: 'app-audience-age',
  templateUrl: './audience-age.component.html',
  styleUrls: ['./audience-age.component.css']
})
export class AudienceAgeComponent implements OnInit {
	public ageAnalyticsErr: any;
	public ageAnalyticsData: any;

	constructor(public analyticsService: AnalyticsService, private _route: Router) { }

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

	navigateToAgeDetails(ageGroup:String){
		if(ageGroup.includes('-') === true){
			let splitAge = ageGroup.split("-");
			let minAge = splitAge[0];
			let maxAge = splitAge[1];
			let navigateUrl = ['/app/analytics/audience/age-details', 'minAge', minAge, 'maxAge', maxAge];
			this._route.navigate(navigateUrl);
		}else{
			let splitAge = ageGroup.split("+");
			let minAge = splitAge[0];
			let navigateUrl = ['/app/analytics/audience/age-details', 'minAge', minAge];
			this._route.navigate(navigateUrl);
		}
	}
}
