import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../services/index';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-audience-country-details',
	templateUrl: './audience-country-details.component.html',
	styleUrls: ['./audience-country-details.component.css']
})
export class AudienceCountryDetailsComponent implements OnInit {
	public countryName: String;
	public countryDetailData: any;
	public countryDetailError: any;

	constructor(public analyticsService: AnalyticsService, private route: ActivatedRoute) { }

	ngOnInit() {
		this.route.params.subscribe(params => {
			this.countryName = params.countryName;
		});
		this.getAudienceCountryAnalytics();
	}

	getAudienceCountryAnalytics(){
		this.analyticsService.getAudienceByCountryDetails([{ countryName: this.countryName }])
			.subscribe(countryDetailData=>{
				this.countryDetailData = countryDetailData;
			}, countryDetailError=>{
				this.countryDetailError = countryDetailError;
			});
	}
}
