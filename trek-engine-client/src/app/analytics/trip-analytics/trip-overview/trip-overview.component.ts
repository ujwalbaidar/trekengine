import { Component, OnInit } from '@angular/core';
import { IMyOptions, IMyDateModel } from 'mydatepicker';
import * as moment from 'moment';

@Component({
	selector: 'app-trip-overview',
	templateUrl: './trip-overview.component.html',
	styleUrls: ['./trip-overview.component.css']
})
export class TripOverviewComponent implements OnInit {

	filterOpt:string = 'fixed';

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
	analyticsEndDate: Object;

	constructor() { }

	ngOnInit() {
		this.getFilterDate();
	}

	onCalendarToggle(event: number): void {
		if(event == 2){
			this.filterOpt = 'custom';
			this.getFilterDate();
		}
	}

	getFilterDate(){
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
		console.log(this.analyticsStartDate);
		console.log(this.analyticsEndDate);
	}


}
