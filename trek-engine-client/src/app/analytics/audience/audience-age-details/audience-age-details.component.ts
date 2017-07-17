import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnalyticsService } from '../../../services/index';

@Component({
	selector: 'app-audience-age-details',
	templateUrl: './audience-age-details.component.html',
	styleUrls: ['./audience-age-details.component.css']
})
export class AudienceAgeDetailsComponent implements OnInit {
	public minAge: String;
	public maxAge: String;

	public ageDetailData: any;
	public ageDetailError: any;

	constructor(private route: ActivatedRoute, public analyticsService: AnalyticsService) { }

	ngOnInit() {
		this.route.params.subscribe(params => {
			this.minAge = params.minAge;
			this.maxAge = params.maxAge;
		});
		this.getAudienceAgeAnalytics();
	}

	getAudienceAgeAnalytics(){
		this.analyticsService.getAudienceByAgeDetails([{ minAge: this.minAge }, { maxAge: this.maxAge }])
			.subscribe(ageDetailData=>{
				this.ageDetailData = ageDetailData;
			}, ageDetailError=>{
				this.ageDetailError = ageDetailError;
			});
	}
}
