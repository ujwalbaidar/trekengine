import { Component, OnInit } from '@angular/core';
import { MovementsService, UserService } from '../../../services/index';
import { Booking, Trip, Flight } from '../../../models/models';
import { ActivatedRoute } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { TripDetailsDialogComponent, FlightDetailsDialogComponent } from '../../index';
declare var jQuery:any;

@Component({
    selector: 'booking-details',
    templateUrl: './src/app/movements/bookings/booking-details/booking-details.component.html'
})
export class BookingDetailsComponent implements OnInit  {
	bookingId: string;
	booking: any;
	trip: any;
	guide: any;
	flight: any;
	travelers: any;
	selectedTraveler: any;
	selectedTravelerArr:any[];
	tripDetails: Trip = <Trip>{};
	flightDetails: Flight = <Flight>{};

	constructor(public movementService:MovementsService, public userService: UserService, private route: ActivatedRoute, public dialog: MdDialog, ){
		jQuery('select').material_select();
		this.route.params.subscribe(params => {
			this.bookingId = params['bookingId'];
	    });
	}

	ngOnInit(){
		this.getBookingDetails();
		this.getTripDetails();
		this.getFlightDetails();
		this.getTravelerDetails();
	}

	getBookingDetails(){
		this.movementService.getBooking([{bookingId:this.bookingId}])
			.subscribe(booking=>{
				this.booking = booking;
				this.selectedTravelerArr = booking['travellers'];
			}, bookingErr=>{
				console.log(bookingErr);
			});
	}

	getTripDetails(){
		this.movementService.getTripDetail([{bookingId:this.bookingId}])
			.subscribe(trip=>{
				if(trip.length>0){
					this.trip = trip[0];
				}
			}, tripErr=>{
				console.log(tripErr);
			});
	}

	getFlightDetails(){
		this.movementService.getFlightDetailsByParams([{bookingId: this.bookingId}])
			.subscribe(flight=>{
				this.flight = flight;
			}, flightErr=>{
				console.log(flightErr);
			});
	}

	
	getGuideLists(){
/*this.userService.queryUser([{email:trip[0]['guideId']}])
.subscribe(guide=>{
	this.guide = guide;
}, guideErr=>{
	console.log(guideErr);
})*/
	}

	getTravelerDetails(){
		this.movementService.queryTravelerDetails([{status: true}, {selected: false}])
			.subscribe(travelers =>{
				travelers.unshift({});
				this.travelers = travelers;
				this.selectedTraveler = 0;
			}, flightErr=>{
				console.log(flightErr);
			});
	}

	selectTraveler(){
		if(this.selectedTraveler>0){
			this.travelers[this.selectedTraveler]["selected"]=true;
			this.travelers[this.selectedTraveler]["bookingId"]=this.bookingId;
			this.movementService.updateTravelerDetails(this.travelers[this.selectedTraveler])
				.subscribe(updateResponse=>{
					if(this.selectedTravelerArr==undefined){
						this.selectedTravelerArr = [];
					}
					this.selectedTravelerArr.push(this.travelers[this.selectedTraveler]);
					this.travelers.splice(this.selectedTraveler,1);
					this.selectedTraveler = 0;
				}, updateErr=>{
					console.log(updateErr);
				});
		}
	}

	removeTraveler(travlerId:string, index:number){
		this.movementService.removeTraveler({
				query:this.bookingId, 
				data:travlerId
			}).subscribe(updateResponse=>{
				this.selectedTravelerArr.splice(index,1);
				this.getTravelerDetails();
			}, updateErr=>{
				console.log(updateErr);
			});
	}

	openAddTripModal(editData:Trip=<Trip>{}) {
		let dialogOptions = {
			height: '600px',
  			width: '600px',
  			position: 'center',
  			disableClose: true,
  			data: {
  				bookingId: this.bookingId
  			}
		};

		if(JSON.stringify(editData) !== '{}'){
			dialogOptions["data"]["records"] = editData;
		};

		let dialogRef = this.dialog.open(TripDetailsDialogComponent, dialogOptions);
    	dialogRef.afterClosed().subscribe(result => {
      		this.trip = result;
    	});
	}

	openFlightModal(editData:Flight=<Flight>{}) {
		let dialogOptions = {
			height: '675px',
  			width: '600px',
  			position: 'center',
  			disableClose: true,
  			data: {
  				bookingId: this.bookingId
  			}
		};

		if(JSON.stringify(editData) !== '{}'){
			dialogOptions["data"]["records"] = Object.assign({},editData);
		}

		let dialogRef = this.dialog.open(FlightDetailsDialogComponent, dialogOptions);
    	dialogRef.afterClosed().subscribe(result => {
    		this.flight = result;
    	});
	}
}
