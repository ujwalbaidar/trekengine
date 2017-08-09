import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { MovementsService, AuthService } from '../../services/index';
import { Booking } from '../../models/models';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css']
})
export class BookingsComponent implements OnInit  {
	bookings: any;
	bookingErr: string;
	isAvailable: boolean = false;

	constructor(public movementService:MovementsService, public dialog: MdDialog, public authService: AuthService, public _route: Router){
		this.authService.getCookies()
			.then(cookieObj=>{
				if(cookieObj['remainingDays'] && parseInt(cookieObj['remainingDays']) >=1){
					this.isAvailable = true;
				}
			});
	}
	ngOnInit(){
		this.getBookingList();
	}

	getBookingList() {
		this.movementService.getBookings()
			.subscribe(bookings=>{
				this.bookings = bookings;
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
			// height: '580px',
  			width: '600px',
  			position: 'center',
  			disableClose: true
		};

		dialogOptions["data"] = {};
		if(JSON.stringify(editData) !== '{}'){
			dialogOptions["data"]["bookings"] = editData;
		}
		let dialogRef = this.dialog.open(BookingsDialogComponent, dialogOptions);
		dialogRef.afterClosed().subscribe(result => {
			if(result !== 'opt-cancel'){
				this._route.navigate(['/app/bookings/booking-details/'+result.bookingId]);
			}
    	});
	}
}

@Component({
	selector: 'bookings-dialog',
	templateUrl: './bookings-dialog.html',
})
export class BookingsDialogComponent implements OnInit {
	booking: Booking = <Booking>{};
	title: string = 'Add Booking Details';
	submittedBookingForm: boolean = false;
	tripInfosCtrl: FormControl;
	filteredTripInfos: any;
	tripInfos: any;
	emptyTripName:boolean = false;

	constructor(public dialogRef: MdDialogRef<BookingsDialogComponent>, public movementServie: MovementsService){
		this.tripInfosCtrl = new FormControl();
		this.filteredTripInfos = this.tripInfosCtrl.valueChanges
	        .startWith(null)
	        .map(name => this.filterTripInfos(name));

		if(this.dialogRef._containerInstance.dialogConfig.data){
			if(this.dialogRef._containerInstance.dialogConfig.data.bookings){
				this.booking = Object.assign({}, this.dialogRef._containerInstance.dialogConfig.data.bookings);
				this.title = 'Edit Booking Details';
			}
		}
	}

	ngOnInit(){
		this.getTripLists();
	}

	getTripLists(){
		this.movementServie.getUserTrekInfos()
			.subscribe(tripInfos=>{
				this.tripInfos = tripInfos;
			}, error=>{
				this.dialogRef.close(error);
			})
	}

	filterTripInfos(val: string) {
		if(this.tripInfosCtrl.value !== undefined && this.tripInfosCtrl.value.length > 0){
			this.emptyTripName = false;
		}else{
			this.emptyTripName = true;
		}
		return val ? this.tripInfos.filter(s => new RegExp(`^${val}`, 'gi').test(s.name)): this.tripInfos;
	}

	selectedTrip(tripInfo: object){
		if(this.booking['tripCost'] == null || this.booking['tripCost'] == undefined){
			this.booking['tripCost'] = tripInfo['cost'];
		}
	}

	submitBookingDetails(bookingForm:any) {
		this.submittedBookingForm = true;
		if(bookingForm.valid && !this.emptyTripName){
			this.booking.tripName = this.tripInfosCtrl.value;
			if(this.dialogRef._containerInstance.dialogConfig.data.bookings){
				this.updateBookingDetails();
			}else{
				this.saveBookingDetails();
			}
		}
	}

	updateBookingDetails() {
		this.movementServie.updateBookingDetails(this.booking)
			.subscribe(booking=>{
				this.submittedBookingForm = false;
				this.dialogRef.close(booking);
			}, error=>{
				this.dialogRef.close(error);
			});
	}

	saveBookingDetails() {
		const saveRequest = this.movementServie.submitBookingDetails(this.booking)
			.then(booking=>{
				this.submittedBookingForm = false;
				this.dialogRef.close(booking);
			});
			
	}
}