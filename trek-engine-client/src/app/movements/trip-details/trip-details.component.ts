import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { Trip } from '../../models/models';
import { IMyOptions, IMyDateModel } from 'mydatepicker';
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/startWith';
import { MovementsService, UserService, AuthService } from '../../services/index';

@Component({
  selector: 'trip-details',
  templateUrl: './trip-details.component.html',
  styleUrls: ['./trip-details.component.css']
})
export class TripDetailsComponent implements OnInit {
	selectedOption: string;
	trip: Trip = <Trip>{};
	trips:any;

	constructor(
		private _route: Router, 
		public dialog: MdDialog, 
		public movementServie: MovementsService, 
		public location: Location,
		public userService: UserService
	){}
	
	ngOnInit(){
		this.getTrips();
	}

	getTrips() {
		this.movementServie.getUserTrekInfos()
		.subscribe(tripsDetail=>{
				this.trips = tripsDetail;
			}, error=>{
				console.log(error);
			});
	}

	deleteTrip(deleteId: string, index: number) {
		this.movementServie.deleteUserTrekInfos(deleteId)
		.subscribe(deleteStatus=>{
			this.trips.splice(index,1);
		}, error => {
			alert('failed to delete record')
		});
	}

	openAddTripModal(editData:Trip=<Trip>{}) {
		let dialogOptions = {
			height: '400px',
  			width: '600px',
  			position: 'center',
  			disableClose: true,
  			data:{
  				bookingId: editData['bookingId']
  			}
		};

		if(JSON.stringify(editData) !== '{}'){
			dialogOptions.data["records"] = editData;
		};

		let dialogRef = this.dialog.open(TripDetailsDialogComponent, dialogOptions);
    	dialogRef.afterClosed().subscribe(result => {
      		this.selectedOption = result;
      		this.getTrips();
    	});
	}

	getDate(dateObj:any){
		return new Date(dateObj.year, dateObj.month, dateObj.day);
	}
}

@Component({
	selector: 'trip-details-dialog',
	templateUrl: './trip-details-dialog.html',
})
export class TripDetailsDialogComponent implements OnInit {
	trip: Trip = <Trip>{};
	public title: string = 'Add Trip Details';
    submittedTripForm: boolean = false;

	constructor(public dialogRef: MdDialogRef<TripDetailsDialogComponent>, public movementServie: MovementsService, public userService:UserService) {
		let bookingId = this.dialogRef._containerInstance.dialogConfig.data.bookingId;
		this.trip['bookingId'] = bookingId;
		if(this.dialogRef._containerInstance.dialogConfig.data && this.dialogRef._containerInstance.dialogConfig.data["records"]){
			this.trip = Object.assign({}, this.dialogRef._containerInstance.dialogConfig.data["records"]);
			this.title = 'Edit Trip Details';
		}
	}
	
	ngOnInit(){
	}
	
	submitTripInfoDetails(tripForm:any) {
		this.submittedTripForm = true;
		if(tripForm.valid){
			if(this.dialogRef._containerInstance.dialogConfig.data && this.dialogRef._containerInstance.dialogConfig.data["records"]){
				this.updateTripInfoDetails();
			}else{
				this.saveTripInfoDetails();
			}
		}
	}

	saveTripInfoDetails(){
		const saveRequest = this.movementServie.createUserTripsData(this.trip)
			.subscribe(tripsDetail=>{
				this.submittedTripForm = false;
				this.dialogRef.close(tripsDetail);
			}, error=>{
				this.submittedTripForm = false;
				this.dialogRef.close(error);
			});
	}

	updateTripInfoDetails() {
		this.movementServie.updateUserTrekInfos(this.trip)
			.subscribe(tripsDetail=>{
				this.submittedTripForm = false;
				this.dialogRef.close(this.trip);
			}, error=>{
				this.submittedTripForm = false;
				this.dialogRef.close(error);
			});
	}

}

@Component({
	selector: 'trip-dates-dialog',
	templateUrl: './trip-dates-dialog.html',
})
export class TripDatesDialogComponent implements OnInit {
	public departure_date: Object;
	public arrival_date: Object;
	public title: string = 'Add Trip Dates';
	public myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
        firstDayOfWeek: 'su',
        sunHighlight: false,
        editableDateField: false
    };
    submittedTripDateForm: boolean = false;
    disableSubmitButton: boolean = false;
	
	hrs: any;
	mins: any;
	trip: Trip = <Trip>{};

	constructor(public dialogRef: MdDialogRef<TripDetailsDialogComponent>, public movementServie: MovementsService, public userService:UserService, public authService: AuthService) {
		let timePicker = this.authService.developTimePicker();
		this.hrs = timePicker.hrs;
		this.mins = timePicker.mins;
		this.trip = <Trip>{departureTime:{hrTime:this.hrs[0],minTime:this.mins[0]}, arrivalTime:{hrTime:this.hrs[0],minTime:this.mins[0]}};
		let bookingId = this.dialogRef._containerInstance.dialogConfig.data.bookingId;
		this.trip['bookingId'] = bookingId;
		if(this.dialogRef._containerInstance.dialogConfig.data && this.dialogRef._containerInstance.dialogConfig.data["records"]){
			this.trip = JSON.parse(JSON.stringify(this.dialogRef._containerInstance.dialogConfig.data["records"]));
			this.title = 'Edit Trip Dates';
			if(this.trip.departureTime == undefined){
				this.trip['departureTime'] = {
					hrTime:this.hrs[0],
					minTime:this.mins[0]
				};
			}

			if(this.trip.arrivalTime == undefined){
				this.trip['arrivalTime'] = {
					hrTime:this.hrs[0],
					minTime:this.mins[0]
				};
			}
		}else{
			this.trip['departureTime'] = {
				hrTime:this.hrs[0],
				minTime:this.mins[0]
			};
			this.trip['arrivalTime'] = {
				hrTime:this.hrs[0],
				minTime:this.mins[0]
			};
		}

	}
	
	ngOnInit(){

	}
	
	submitTripDates(tripDateForm:any) {
		this.submittedTripDateForm = true;
		if(tripDateForm.valid){
			this.disableSubmitButton = true;
			if(this.dialogRef._containerInstance.dialogConfig.data && this.dialogRef._containerInstance.dialogConfig.data["records"]){
				this.updateTripDates();
			}else{
				this.saveTripDates();
			}
		}
	}

	saveTripDates(){
		const saveRequest = this.movementServie.submitTripDetails(this.trip)
			.subscribe(tripsDetail=>{
				this.submittedTripDateForm = false;
				this.disableSubmitButton = false;
				this.dialogRef.close(tripsDetail);
			}, error=>{
				this.submittedTripDateForm = false;
				this.disableSubmitButton = false;
				this.dialogRef.close(error);
			});
	}

	updateTripDates() {
		this.movementServie.updateTrekDetails(this.trip)
			.subscribe(tripsDetail=>{
				this.submittedTripDateForm = false;
				this.disableSubmitButton = false;
				this.dialogRef.close(this.trip);
			}, error=>{
				this.submittedTripDateForm = false;
				this.disableSubmitButton = false;
				this.dialogRef.close(error);
			});
	}

}