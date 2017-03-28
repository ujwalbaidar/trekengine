import { Component, OnInit } from '@angular/core';
import { MovementsService, UserService } from '../../../services/index';
import { Booking, Trip, Flight, Traveler } from '../../../models/models';
import { ActivatedRoute } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { BookingsDialogComponent, TripDetailsDialogComponent, FlightDetailsDialogComponent, TravellerDetailsDialogComponent } from '../../index';
declare var jQuery:any;

@Component({
    selector: 'booking-details',
    templateUrl: './src/app/movements/bookings/booking-details/booking-details.component.html'
})
export class BookingDetailsComponent implements OnInit  {
	bookingId: string;
	booking: any;
	trip: any;
	guides: any;
	flight: any;
	travelers: any;
	selectedTraveler: any;
	selectedTravelerArr:any[];
	tripDetails: Trip = <Trip>{};
	flightDetails: Flight = <Flight>{};
	travelerDetails: Traveler = <Traveler>{};
	selectedGuide: any;
	bookingGuide: any;

	constructor(public movementService:MovementsService, public userService: UserService, private route: ActivatedRoute, public dialog: MdDialog, ){
		jQuery('select').material_select();
		this.route.params.subscribe(params => {
			this.bookingId = params['bookingId'];
	    });
	}

	ngOnInit(){
		// this.developTimePicker();
		this.getBookingDetails();
		this.getTripDetails();
		this.getFlightDetails();
		this.getTravelerDetails();
		this.getGuideLists();
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
		this.userService.getGuides()
		.subscribe(guide=>{
			guide['guides'].unshift({});
			this.guides = guide['guides'];
			if(this.booking && this.booking.selectedGuide){
				for(let i=0;i<this.guides.length;i++){
					if(this.guides[i]['email'] === this.booking.selectedGuide){
						this.bookingGuide = this.guides[i];
						this.selectedGuide = i;
					}
				}
			}else{
				this.selectedGuide = 0;
			}
		}, guideErr=>{
			console.log(guideErr);
		})
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

	openBookingModal(){
		let dialogOptions = {
			height: '600px',
  			width: '600px',
  			position: 'center',
  			disableClose: true
		};

		dialogOptions["data"] = {};
		dialogOptions["data"]["bookings"] = this.booking;

		let dialogRef = this.dialog.open(BookingsDialogComponent, dialogOptions);
    	dialogRef.afterClosed().subscribe(result => {
      		this.getBookingDetails();
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
			height: '400px',
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
    		if(result!=="Option 1"){
      			this.trip = result;
    		}
    	});
	}

	selectGuide(){
		if(this.selectedGuide>0){
			this.booking['selectedGuide'] = this.guides[this.selectedGuide]['email']; 
			this.movementService.updateBookingDetails(this.booking)
				.subscribe(updateResponse=>{
					this.bookingGuide = this.guides[this.selectedGuide];
				}, updateError=>{
					console.log(updateError);
				});
		}
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
    		if(result!=="Option 1"){
      			this.flight = result;
    		}
    	});
	}

	openTravelerModal(data:Traveler=<Traveler>{}, actionMode:string, index:number) {
		let dialogOptions = {
			height: '600px',
  			width: '600px',
  			position: 'center',
  			disableClose: true,
  			data: {
  				bookingId: this.bookingId
  			}
		};
		dialogOptions["data"]["mode"] = actionMode;

		if(JSON.stringify(data) !== '{}'){
			dialogOptions["data"]["travelerInfo"] = data;
		};

		let dialogRef = this.dialog.open(TravellerDetailsDialogComponent, dialogOptions);
    	dialogRef.afterClosed().subscribe(result => {
    		if(result!=="Option 1" && actionMode == 'edit'){
    			this.selectedTravelerArr[index] = result; 
    		}else if(result!=="Option 1" && actionMode == 'add'){
    			this.selectedTravelerArr.push(result);
    		}
    	});
	}
}
