import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { Trip } from '../../models/models';
import { IMyOptions, IMyDateModel } from 'mydatepicker';
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/startWith';
import { MovementsService, UserService } from '../../services/index';

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
		this.movementServie.getTripDetails()
		.subscribe(tripsDetail=>{
				this.trips = tripsDetail;
			}, error=>{
				console.log(error);
			});
	}

	deleteTrip(deleteId: string, index: number) {
		this.movementServie.deleteTrip(deleteId)
		.subscribe(deleteStatus=>{
			this.trips.splice(index,1);
		}, error => {
			alert('failed to delete record')
		});
	}

	openAddTripModal(editData:Trip=<Trip>{}) {
		let dialogOptions = {
			height: '700px',
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
	public departure_date: Object;
	public arrival_date: Object;
	public title: string = 'Add Trip Details';
	public myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
        firstDayOfWeek: 'su',
        sunHighlight: false,
        editableDateField: false
    };
	guideUsers:any;
	approver: string;
    selectedValue: string;
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
	
	submitTrekDetails(tripForm:any) {
		this.submittedTripForm = true;
		if(tripForm.valid){
			if(this.dialogRef._containerInstance.dialogConfig.data && this.dialogRef._containerInstance.dialogConfig.data["records"]){
				this.updateTrekDetails();
			}else{
				this.saveTrekDetails();
			}
		}
	}

	saveTrekDetails(){
		const saveRequest = this.movementServie.submitTripDetails(this.trip)
			.subscribe(tripsDetail=>{
				this.submittedTripForm = false;
				this.dialogRef.close(tripsDetail);
			}, error=>{
				this.submittedTripForm = false;
				this.dialogRef.close(error);
			});
	}

	updateTrekDetails() {
		this.movementServie.updateTrekDetails(this.trip)
			.subscribe(tripsDetail=>{
				this.submittedTripForm = false;
				this.dialogRef.close(this.trip);
			}, error=>{
				this.submittedTripForm = false;
				this.dialogRef.close(error);
			});
	}

}
