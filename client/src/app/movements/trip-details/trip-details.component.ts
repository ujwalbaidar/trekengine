import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { Trip } from './trip-details.model';
import { IMyOptions, IMyDateModel } from 'mydatepicker';
import { MovementsService, UserService } from '../../services/index';

@Component({
    selector: 'trip-details',
    templateUrl: './src/app/movements/trip-details/trip-details.component.html'
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
		})
	}

	openAddTripModal(editData:Trip=<Trip>{}){
		let dialogOptions = {
			height: '600px',
  			width: '600px',
  			position: 'center',
  			disableClose: true
		};

		if(JSON.stringify(editData) !== '{}'){
			dialogOptions["data"] = editData;
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
	templateUrl: './src/app/movements/trip-details/trip-details-dialog.html',
})
export class TripDetailsDialogComponent implements OnInit {
	trip: Trip = <Trip>{};
	public departure_date: Object;
	public arrival_date: Object;
	public title: string = 'Add Trip Details';
	private myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
    };
	guideUsers:any;
	approver: string;
    selectedValue: string;
    
	constructor(public dialogRef: MdDialogRef<TripDetailsDialogComponent>, public movementServie: MovementsService, public userService:UserService) {
		if(this.dialogRef.config.data){
			this.trip = Object.assign({}, this.dialogRef.config.data);
			this.title = 'Edit Trip Details';
		}
	}
	
	ngOnInit(){
		this.getGuideLists();
	}


	getGuideLists(){
		this.userService.getGuides()
		.subscribe(users=>{
				this.guideUsers = users['guides'];
				this.approver = users['approver'];
			}, userError=>{
				console.log(userError);
			});
	}

	submitTrekDetails(tripForm:any) {
		if(tripForm.valid){
			if(this.dialogRef.config.data){
				this.updateTrekDetails();
			}else{
				this.saveTrekDetails();
			}
		}
	}

	saveTrekDetails(){
		const saveRequest = this.movementServie.submitTripDetails(this.trip)
			.subscribe(tripsDetail=>{
				this.dialogRef.close(tripsDetail);
			}, error=>{
				this.dialogRef.close(error);
			}, () => { console.log('Completed'); });
			setTimeout(() => {
				saveRequest.unsubscribe();
			},30)
	}

	updateTrekDetails() {
		this.movementServie.updateTrekDetails(this.trip)
			.subscribe(tripsDetail=>{
				this.dialogRef.close(tripsDetail);
			}, error=>{
				this.dialogRef.close(error);
			});
	}
}