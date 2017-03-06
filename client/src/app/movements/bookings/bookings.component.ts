import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { MovementsService, UserService } from '../../services/index';
import { Booking } from '../../models/models';

@Component({
    selector: 'bookings',
    templateUrl: './src/app/movements/bookings/bookings.component.html'
})
export class BookingsComponent implements OnInit  {
	bookings: any;
	trips: any;
	bookingErr: string;

	constructor(public movementService:MovementsService, public dialog: MdDialog){}
	ngOnInit(){
		this.getBookingList();
	}

	getBookingList() {
		this.movementService.getBookings()
			.subscribe(bookings=>{
				this.movementService.getTripDetails()
				.subscribe(trips=>{
					this.trips = trips;
					for(var i=0; i< bookings['length'];i++){
						let filter = this.trips.filter((trip:any) => {
						 	return trip._id === bookings[i]['tripId'];
						});
						bookings[i]['trips'] = filter[0];
					}
					this.bookings = bookings;
				}, tripsErr=>{
					this.bookingErr = 'Failed to Load Trip Details';
				});
			}, bookingErr=>{
				this.bookingErr = 'Failed to Load Booking Details';
			});
	}

	deleteBooking(deleteId: string, index: number) {
		this.movementService.deleteBooking(deleteId)
			.subscribe(deleteStatus=>{
			this.bookings.splice(index,1);
		}, error => {
			this.bookingErr = 'Failed to Delete Booking Details';
		});
	}

	openAddBookingModal(editData:Booking=<Booking>{}){
		let dialogOptions = {
			height: '600px',
  			width: '600px',
  			position: 'center',
  			disableClose: true
		};

		dialogOptions["data"] = {};
		if(JSON.stringify(editData) !== '{}'){
			dialogOptions["data"]["bookings"] = editData;
		}
		dialogOptions["data"]["trips"] = this.trips;

		let dialogRef = this.dialog.open(BookingsDialogComponent, dialogOptions);
    	dialogRef.afterClosed().subscribe(result => {
      		this.getBookingList();
    	});
	}
}

@Component({
	selector: 'bookings-dialog',
	templateUrl: './src/app/movements/bookings/bookings-dialog.html',
})
export class BookingsDialogComponent implements OnInit {
	booking: Booking = <Booking>{};
	trips: any;
	title: string = 'Add Booking Details';
	constructor(public dialogRef: MdDialogRef<BookingsDialogComponent>, public movementServie: MovementsService){
		if(this.dialogRef.config.data){
			this.trips = this.dialogRef.config.data.trips;
			if(this.dialogRef.config.data.bookings){
				this.booking = Object.assign({}, this.dialogRef.config.data.bookings);
				this.title = 'Edit Booking Details';
			}
		}
	}

	ngOnInit(){

	}

	submitBookingDetails(tripForm:any) {
		if(tripForm.valid){
			if(this.dialogRef.config.data.bookings){
				this.updateBookingDetails();
			}else{
				this.saveBookingDetails();
			}
		}
	}

	updateBookingDetails() {
		this.movementServie.updateBookingDetails(this.booking)
			.subscribe(booking=>{
				this.dialogRef.close(booking);
			}, error=>{
				this.dialogRef.close(error);
			});
	}

	saveBookingDetails() {
		const saveRequest = this.movementServie.submitBookingDetails(this.booking)
			.then(booking=>{
				this.dialogRef.close(booking);
			})
		// .subscribe(booking=>{
		// 		this.dialogRef.close(booking);
		// 	}, error=>{
		// 		this.dialogRef.close(error);
		// 	}, () => { 
		// 		saveRequest.unsubscribe();
		// 	});
		// debugger;
		// setTimeout(() => {
		// 		saveRequest.unsubscribe();
		// 	},30);
			
	}
}