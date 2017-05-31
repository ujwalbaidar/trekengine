import { Component, OnInit } from '@angular/core';
import { AuthService, MovementsService, UserService } from '../../../services/index';
import { Booking, Trip, Flight, Traveler } from '../../../models/models';
import { ActivatedRoute, Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { BookingsDialogComponent, TripDetailsDialogComponent, FlightDetailsDialogComponent, TravellerDetailsDialogComponent } from '../../index';
declare var jQuery:any;
import { CookieService } from 'angular2-cookie/core';

@Component({
  selector: 'booking-details',
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.css']
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
	auths: any;
	
	constructor(
		public authService: AuthService,
		public movementService:MovementsService, 
		public userService: UserService, 
		private route: ActivatedRoute, 
		public dialog: MdDialog, private _route:Router,
		public _cookieService: CookieService
	){
		jQuery('select').material_select();
		this.route.params.subscribe(params => {
			this.bookingId = params['bookingId'];
	    });
	}

	ngOnInit(){
		this.auths = this._cookieService.getAll();
		this.getBookingDetails();
		this.getTripDetails();
		this.getFlightDetails();
		this.getTravelerDetails();
		this.getGuideLists();
	}


	getBookingDetails(){
		this.movementService.getBooking([{bookingId:this.bookingId}])
			.subscribe(booking=>{
				if(JSON.stringify(booking)=="{}"){
					this._route.navigate(['/app/bookings']);
				}else{
					this.booking = booking;
					this.selectedTravelerArr = booking['travellers'];
				}
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
			if(this.auths['idx'] === '20'){
				if(guide['guides'] && guide['guides'].length>0){
					guide['guides'].unshift({});
				}
				this.guides = guide['guides'];
				if(this.booking && this.booking.selectedGuide){
					if(this.guides){
						for(let i=0;i<this.guides.length;i++){
							if(this.guides[i]['email'] === this.booking.selectedGuide){
								this.bookingGuide = this.guides[i];
								this.selectedGuide = i;
							}
						}
					}
				}else{
					this.selectedGuide = 0;
				}
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
			height: '420px',
  			width: '600px',
  			position: 'center',
  			disableClose: true
		};

		dialogOptions["data"] = {};
		dialogOptions["data"]["bookings"] = this.booking;

		let dialogRef = this.dialog.open(BookingsDialogComponent, dialogOptions);
    	dialogRef.afterClosed().subscribe(result => {
    		if(result!=='cancel'){
      			this.getBookingDetails();
    		}
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
			height: '350px',
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
    		if(result!=="opt-cancel"){
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
    		if(result!=="opt-cancel"){
      			this.flight = result;
    		}
    	});
	}
	openTravelerModal(travelerRecord:any, actionMode:string) {
		let dialogOptions = {
			height: '600px',
  			width: '600px',
  			position: 'center',
  			disableClose: true,
  			data: {
  				bookingId: this.bookingId,
  				mode: actionMode
  			}
		};

		if(JSON.stringify(travelerRecord) !== '{}'){
			dialogOptions["data"]["records"] = travelerRecord;
		};

		let dialogRef = this.dialog.open(TravellerDetailsDialogComponent, dialogOptions);
    	dialogRef.afterClosed().subscribe(result => {
    		if(result!=="Option 1" && actionMode == 'edit'){
    			this.getBookingDetails();
    		}else if(result!=="Option 1" && actionMode == 'add'){
    			this.getBookingDetails();
    		}
    	});
	}
}
