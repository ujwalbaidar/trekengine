import { Location } from '@angular/common';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { MovementsService, AuthService, ExportReportService } from '../../services/index';
import { Booking } from '../../models/models';
import { FormControl } from '@angular/forms';
import { DeleteConfimationDialogComponent } from '../../delete-confimation-dialog/delete-confimation-dialog.component';

@Component({
  selector: 'bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css']
})
export class BookingsComponent implements OnInit, AfterViewInit  {
	bookings: any;
	bookingErr: string;
	isAvailable: boolean = false;
	cookieData: any;
	public currentBookingPage:number = 0;
	public totalBookingPages: any;

	constructor(
		public movementService:MovementsService, 
		public exportReportService:ExportReportService, 
		public dialog: MdDialog, 
		public authService: AuthService, 
		public _route: Router){
		
	}
	ngOnInit(){
		this.getBookingList(this.currentBookingPage);
	}
	
	ngAfterViewInit(){
		this.authService.getCookies()
			.then(cookieObj=>{
				if(cookieObj!==undefined && cookieObj['remainingDays'] && parseInt(cookieObj['remainingDays']) >=1){
					this.isAvailable = true;
					this.cookieData = cookieObj;
				}else{
					this.isAvailable = false;
				}
			});
	}

	getBookingList(currentBookingPage) {
		this.movementService.getBookings([{queryPage: currentBookingPage}])
			.subscribe(bookingsData=>{
				this.totalBookingPages = new Array( bookingsData.totalBookings );
				this.bookings = bookingsData.bookings;
			}, bookingErr=>{
				this.bookingErr = 'Failed to Load Booking Details';
			});
	}

	changePagination(index){
  		this.currentBookingPage = index;
  		this.getBookingList(index);
  	}

	deleteBooking(deleteId: string, index: number) {
		let dialogOptions = {
  			width: '600px',
  			position: 'center',
  			disableClose: true
		};

		dialogOptions["data"] = {};
		
		let dialogRef = this.dialog.open(DeleteConfimationDialogComponent, dialogOptions);
    	dialogRef.afterClosed().subscribe(result => {
    		let selectedOption = parseInt(result);
    		if(selectedOption == 1){
    			this.movementService.deleteBooking(deleteId)
					.subscribe(deleteStatus=>{
						this.bookings.splice(index,1);
					}, error => {
						this.bookingErr = 'Failed to Delete Booking Details';
					});
    		}
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

	exportCsv(){
		this.exportReportService.exportBookingDetails()
			.subscribe(csvDataObj=>{
				var data, filename, link;
		        var csv = this.exportReportService.convertArrayOfObjectsToCSV({
		            data: csvDataObj
		        });
		        if (csv == null) return;
		        filename = 'booking-report.csv';

		        if (!csv.match(/^data:text\/csv/i)) {
		            csv = 'data:text/csv;charset=utf-8,' + csv;
		        }
		        data = encodeURI(csv);

		        link = document.createElement('a');
		        link.setAttribute('href', data);
		        link.setAttribute('download', filename);
		        link.click();
			}, error=>{
				console.log(error)
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
