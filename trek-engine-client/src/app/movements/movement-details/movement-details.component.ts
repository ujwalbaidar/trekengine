import { Component, OnInit } from '@angular/core';
import {IMyOptions, IMyDateModel} from 'mydatepicker';
import * as moment from 'moment';
import { MovementsService } from '../../services/index';

@Component({
  selector: 'movement-details',
  templateUrl: './movement-details.component.html',
  styleUrls: ['./movement-details.component.css']
})
export class MovementDetailsComponent implements OnInit {
	filterOpt:string = 'upcoming';
	myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
        firstDayOfWeek: 'su',
        sunHighlight: false,
        editableDateField: false
    };
    treks: any;
    public arrivalDate: Object;
    public departureDate: Object;
    public totalTreksData: number; 
    public totalFilterMovementPages: any;
    public currentMovementPage:number = 0;

  	constructor(public movementService: MovementsService) {
  		
  	}

	ngOnInit() {
		this.getFilterDate();
	}

	getFilterDate(){
		this.currentMovementPage = 0;
		switch (this.filterOpt) {
			case 'weekly':
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
				break;
			case 'monthly':
				var startDate = moment().startOf('month').toDate();
				var endDate   = moment().endOf('month').toDate();
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
				break;

			case 'daily':
				var startDate = moment().startOf('date').toDate();
				var endDate   = moment().endOf('date').toDate();
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
				break;
			case 'yearly':
				var startDate = moment().startOf('year').toDate();
				var endDate   = moment().endOf('year').toDate();
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
				break;
			case 'upcoming':
				var startDate = moment().startOf('date').toDate();
				var endDate   = moment().startOf('date').toDate();
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
				break;
		}
		this.filterTreks();
	}
	
	filterTreks(){
		this.movementService.filterTrek([{departureDate:JSON.stringify(this.departureDate)}, {arrivalDate:JSON.stringify(this.arrivalDate)}, {filterType: this.filterOpt}, {queryPage: this.currentMovementPage}])
			.subscribe(treks=>{
				this.totalTreksData = treks['totalData'];
				this.totalFilterMovementPages = new Array(this.totalTreksData );
				this.treks = treks['data'];
			}, trekError=>{
				console.log(trekError);
			});
	}

	onCalendarToggle(event: number): void {
		if(event == 2){
			this.filterOpt = 'custom';
			this.getFilterDate()
		}
  	}

  	changePagination(index){
  		this.currentMovementPage = index;
  		this.filterTreks();
  	}

}
