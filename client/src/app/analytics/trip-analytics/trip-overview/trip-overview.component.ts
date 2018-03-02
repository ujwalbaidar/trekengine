import { Component, OnInit } from '@angular/core';
import { IMyOptions, IMyDateModel } from 'mydatepicker';
import * as moment from 'moment';
import { AnalyticsService } from '../../../services/index';

@Component({
	selector: 'app-trip-overview',
	templateUrl: './trip-overview.component.html',
	styleUrls: ['./trip-overview.component.css']
})
export class TripOverviewComponent implements OnInit {

	/*filterOpt:string = 'fixed';

	analyticsStartDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
        firstDayOfWeek: 'su',
        sunHighlight: false,
        editableDateField: false
    };

    analyticsEndDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
        firstDayOfWeek: 'su',
        sunHighlight: false,
        editableDateField: false
    };

    analyticsStartDate: Object;
	analyticsEndDate: Object;*/
	myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
        firstDayOfWeek: 'su',
        sunHighlight: false,
        editableDateField: false
    };
    analyticsStartDate: any;
	analyticsEndDate: any;

	overviewError:any;
	mostSoldInfo: any;
	mostSoldNumbers: any;

	constructor(private analyticsService:AnalyticsService) { }

	ngOnInit() {
		var startDate = moment().startOf('year').toDate();
		var endDate   = moment().endOf('year').toDate();
		
		this.analyticsStartDate = {
			date: {
				year: startDate.getFullYear(),
				month: startDate.getMonth()+1,
				day: startDate.getDate()
			},
			epoc: Math.floor(startDate.getTime()/1000)
		};
		this.analyticsEndDate = {
			date: {
				year: endDate.getFullYear(),
				month: endDate.getMonth()+1,
				day: endDate.getDate()
			},
			epoc: Math.floor(endDate.getTime()/1000)
		};
		this.getTrekOverview({startDate: this.analyticsStartDate, endDate: this.analyticsEndDate});
	}

	onCalendarToggle(event: number): void {
		if(event == 2){
			// this.filterOpt = 'custom';
			// this.getFilterDate();
			this.getTrekOverview({startDate: this.analyticsStartDate, endDate: this.analyticsEndDate});
		}
	}

	/*getFilterDate(){
		switch (this.filterOpt) {
			case 'fixed':
				let todayDate = moment();
				let startDayDate = moment(todayDate).subtract(7, 'days');
				let lastDayDate = moment(todayDate).subtract(1, 'days');
				
				this.analyticsEndDatePickerOptions['disableUntil'] = {
					year: lastDayDate['_d'].getFullYear(), 
					month: lastDayDate['_d'].getMonth()+1, 
					day: lastDayDate['_d'].getDate()-1 
				};
				
				this.analyticsStartDate = {
					date: {
						year: startDayDate['_d'].getFullYear(),
						month: startDayDate['_d'].getMonth()+1,
						day: startDayDate['_d'].getDate()
					},
					epoc: Math.floor(startDayDate['_d'].getTime()/1000)
				};

				this.analyticsEndDate = {
					date: {
						year: lastDayDate['_d'].getFullYear(),
						month: lastDayDate['_d'].getMonth()+1,
						day: lastDayDate['_d'].getDate()
					},
					epoc: Math.floor(lastDayDate['_d'].getTime()/1000)
				};
			break;
		}
		this.pushInput();
	}

	pushInput(){
		this.getTrekOverview();
	}*/

	getTrekOverview(filterDate){
		this.analyticsService.getTrekOverview(filterDate)
			.subscribe(overviewData=>{
				this.mostSoldInfo = overviewData[0];
				this.mostSoldNumbers = overviewData[1];
			}, overviewError=>{
				this.overviewError = overviewError;
			});
	}

}
