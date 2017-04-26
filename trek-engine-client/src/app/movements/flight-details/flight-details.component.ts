import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { Flight } from '../../models/models';
import { IMyOptions, IMyDateModel } from 'mydatepicker';
import { MovementsService } from '../../services/index';

@Component({
  selector: 'flight-details',
  templateUrl: './flight-details.component.html',
  styleUrls: ['./flight-details.component.css']
})
export class FlightDetailsComponent implements OnInit  {
	selectedOption: string;
	flight: Flight = <Flight>{};
	public flights: any;
	constructor(
		private _route: Router, 
		public dialog: MdDialog, 
		public movementServie: MovementsService
	){}

	ngOnInit() {
		this.getFlightLists();
	}

	getFlightLists() {
		this.movementServie.getFlightDetails()
		.subscribe(flights=>{
				this.flights = flights;
			}, error=>{
				console.log(error);
			});
	}

	deleteFlight(flightId:string, index:number) {
		this.movementServie.deleteFlightDetails(flightId)
		.subscribe(users=>{
				this.flights.splice(index, 1);
			}, userError=>{
				console.log(userError);
			});
	}

	openFlightModal(editData:Flight=<Flight>{}) {
		let dialogOptions = {
			height: '675px',
  			width: '600px',
  			position: 'center',
  			disableClose: true,
  			data:{
  				bookingId:editData['bookingId']
  			}
		};

		if(JSON.stringify(editData) !== '{}'){
			dialogOptions['data']['records'] = Object.assign({},editData);
		}

		let dialogRef = this.dialog.open(FlightDetailsDialogComponent, dialogOptions);
    	dialogRef.afterClosed().subscribe(result => {
    		this.selectedOption = result;
    		this.getFlightLists();
    	});
	}
}

@Component({
	selector: 'flight-details-dialog',
	templateUrl: './flight-details-dialog.html',
})
export class FlightDetailsDialogComponent implements OnInit {
	flight= <Flight>{};
	hrs:any[];
	mins: any[];
	submittedFlightForm: boolean = false;

	public title: string = 'Add Flight Details';
	public myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
        firstDayOfWeek: 'su',
        sunHighlight: false,
        editableDateField: false
    };
	constructor(
		public dialogRef: MdDialogRef<FlightDetailsDialogComponent>, 
		public movementServie: MovementsService
	) {
		this.developTimePicker();
		if(this.dialogRef._containerInstance.dialogConfig.data && this.dialogRef._containerInstance.dialogConfig.data.records){
			this.flight = JSON.parse(JSON.stringify(this.dialogRef._containerInstance.dialogConfig.data.records));
			this.flight.booking = this.dialogRef._containerInstance.dialogConfig.data.bookingId;
			this.title = 'Edit Flight Details';
		}else{
			this.flight = <Flight>{departure:{hrTime:this.hrs[0], minTime:this.mins[0]}, arrival:{hrTime:this.hrs[0], minTime:this.mins[0]}};
			this.flight["bookingId"] = this.dialogRef._containerInstance.dialogConfig.data.bookingId;
		}
	}

	ngOnInit(){
	}

	developTimePicker(){
		for(let i=0; i<24;i++){
			if(this.hrs == undefined){
				this.hrs = [];
			}
			if(i<10){
				this.hrs.push('0'+i);
			}else{
				this.hrs.push(JSON.stringify(i));
			}
		}
		for(let i=0; i<=55;i+=5){
			if(this.mins == undefined){
				this.mins = [];
			}
			if(i<10){
				this.mins.push('0'+i);
			}else{
				this.mins.push(JSON.stringify(i));
			}
		}
	}

	submitFlightDetails(flightForm:any) {
		this.submittedFlightForm = true;
		if(flightForm.valid){
			if(this.dialogRef._containerInstance.dialogConfig.data && this.dialogRef._containerInstance.dialogConfig.data.records){
				this.updateFlightDetails();
			}else{
				this.saveFlightDetails();
			}
		}
	}

	saveFlightDetails() {
		const saveRequest = this.movementServie.submitFlightDetails(this.flight)
			.subscribe(flightDetail=>{
			this.submittedFlightForm = false;
				this.dialogRef.close(flightDetail);
			}, error=>{
			this.submittedFlightForm = false;
				this.dialogRef.close(error);
			});
	}

	updateFlightDetails() {
		this.movementServie.updateFlightDetails(this.flight)
			.subscribe(flightDetail=>{
			this.submittedFlightForm = false;
				this.dialogRef.close(this.flight);
			}, error=>{
			this.submittedFlightForm = false;
				this.dialogRef.close(error);
			});
	}
}
