import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { Flight } from '../../models/models';
import { IMyOptions, IMyDateModel } from 'mydatepicker';
import { MovementsService } from '../../services/index';

@Component({
    selector: 'flight-details',
    templateUrl: './src/app/movements/flights/flight-details.component.html'
})
export class FlightDetailsComponent implements OnInit  {
	selectedOption: string;
	flight: Flight = <Flight>{};
	private flights: any;
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
  			disableClose: true
		};

		if(JSON.stringify(editData) !== '{}'){
			dialogOptions["data"] = Object.assign({},editData);
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
	templateUrl: './src/app/movements/flights/flight-details-dialog.html',
})
export class FlightDetailsDialogComponent implements OnInit {
	bookings: any;
    private flight: Flight = <Flight>{};
	public title: string = 'Add Flight Details';
	private myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
    };
	constructor(
		public dialogRef: MdDialogRef<FlightDetailsDialogComponent>, 
		public movementServie: MovementsService) {
		if(this.dialogRef.config.data && this.dialogRef.config.data.records){
			this.flight = Object.assign({}, this.dialogRef.config.data);
			this.flight.departure.date = this.flight.departure['dateTime'];
			this.flight.arrival.date = this.flight.arrival['dateTime'];
			this.title = 'Edit Flight Details';
			this.flight.booking = this.flight['bookingId'];
		}else{
			this.flight = <Flight>{departure:{}, arrival:{}};
			this.flight["bookingId"] = this.dialogRef.config.data.bookingId;
		}
	}

	ngOnInit(){
		this.getBookingDetails();
	}

	getBookingDetails(){
		this.movementServie.getBookings()
			.subscribe(bookings=>{
				this.bookings = bookings;
			},bookingErr=>{
				console.log(bookingErr);
			});
	}

	submitFlightDetails(flightForm:any) {
		if(flightForm.valid){
			if(this.dialogRef.config.data && this.dialogRef.config.data.records){
				this.updateFlightDetails();
			}else{
				this.saveFlightDetails();
			}
		}
	}

	saveFlightDetails() {
		const saveRequest = this.movementServie.submitFlightDetails(this.flight)
			.subscribe(flightDetail=>{
				this.dialogRef.close(flightDetail);
			}, error=>{
				this.dialogRef.close(error);
			});
	}

	updateFlightDetails() {
		this.movementServie.updateFlightDetails(this.flight)
			.subscribe(flightDetail=>{
				this.dialogRef.close(flightDetail);
			}, error=>{
				this.dialogRef.close(error);
			});
	}
}
