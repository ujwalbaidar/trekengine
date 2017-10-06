import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';
import { MdSnackBar } from '@angular/material';
import { AnalyticsService } from '../services/index';
import { MovementsService } from '../services/index';
import * as moment from 'moment';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
	public cookieIdx: Number;
	public mostSoldInfo: any;
	public mostSoldNumbers: any;

	public audienceAgeGenderGroups: any;
	public audienceCountryGroups: any;

	public column_ChartData: any = [];
	public column_ChartOptions:any;
	public area_ChartData: any;
	
	public arrivalDate: Object;
    public departureDate: Object;
    treks: any;
    public monthlyBookings: any;
	public pieData: any = [];
	public columnChartData: any = [];
	public columnChartStackData: any = [];

	constructor(public _cookieService:CookieService, private _route:Router, private analyticsService:AnalyticsService, public snackBar: MdSnackBar, public movementService: MovementsService) { 
	}

	ngOnInit() {
		this.cookieIdx = parseInt(this._cookieService.get('idx'));
		if(window.name && window.name == 'GoogleAuth'){
		 	window.opener.location.reload();
			window.close();
		}
		if(this.cookieIdx === 20){
			this.getTripOverview();
			this.getAudienceOverViewData();
			this.getWeeksBookings();
			this.getMonthlyBookingsCounts();
		}
		/*let cookieIdx = this._cookieService.get('idx');
		if (parseInt(cookieIdx) === 20) {
			this._route.navigate(['/app/bookings']);
		}else if(parseInt(cookieIdx) === 30){
			this._route.navigate(['/app/movements']);
		}else{
		}*/
	}

	getMonthlyBookingsCounts(){
		this.analyticsService.getMonthlyBookings()
			.subscribe(monthlyBookings=>{
				this.monthlyBookings = monthlyBookings;

			}, error=>{

			});
	}

	getWeeksBookings(){
		var startDate = moment().startOf('week').toDate();
		var endDate   = moment().endOf('week').toDate();
		this.departureDate = {
			date: {
				year: startDate.getFullYear(),
				month: startDate.getMonth()+1,
				day: startDate.getDate()
			},
			epoc: Math.floor(startDate.getTime()/1000)
		};

		this.arrivalDate = {
			date: {
				year: endDate.getFullYear(),
				month: endDate.getMonth()+1,
				day: endDate.getDate()
			},
			epoc: Math.floor(endDate.getTime()/1000)
		}

		this.movementService.filterTrek([
				{departureDate:JSON.stringify(this.departureDate)}, 
				{arrivalDate:JSON.stringify(this.arrivalDate)}, 
				{filterType: 'weekly'}, 
				{queryPage: 0}
			])
			.subscribe(treks=>{
				this.treks = treks['data'];
			}, trekError=>{
				console.log(trekError);
			});
	}

	getAudienceOverViewData(){
		this.analyticsService.getAudienceOverview()
			.subscribe(overviewData=>{
				this.audienceAgeGenderGroups = overviewData[0];
				this.audienceCountryGroups = overviewData[1];
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
   				
			}, overviewDataErr=>{
				this.snackBar.open('Error has been occured to retrieve Audience Overview Data.', '', {
						duration: 3000,
					});
			});
	}

	getTripOverview(){
		this.analyticsService.getTrekOverview()
			.subscribe(overviewData=>{
				this.mostSoldInfo = overviewData[0];
				this.mostSoldNumbers = overviewData[1];
			}, overviewError=>{
				this.snackBar.open('Error has been occured to retrieve Trip Overview Data.', '', {
						duration: 3000,
					});
			});
	}	
}
