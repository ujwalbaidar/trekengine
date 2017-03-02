import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { Trip } from './trip-details.model';
import { IMyOptions, IMyDateModel } from 'mydatepicker';
import { MovementsService } from '../../services/index';

@Component({
    selector: 'trip-details',
    templateUrl: './src/app/movements/trip-details/trip-details.component.html'
})
export class TripDetailsComponent implements OnInit {
	selectedOption: string;
	trip: Trip = <Trip>{};
	trips:any;
	constructor(private _route: Router, public dialog: MdDialog, public movementServie: MovementsService, public location: Location){}
	ngOnInit(){
		this.getTrips();
	}

	getTrips() {
		this.movementServie.getTripDetails()
		.subscribe(tripsDetail=>{
				this.trips = tripsDetail;
			}, error=>{
				// 
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
export class TripDetailsDialogComponent {
	trip: Trip = <Trip>{};
	public departure_date: Object;
	public arrival_date: Object;
	public title: string = 'Add Trip Details';
	private myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
    };

	constructor(public dialogRef: MdDialogRef<TripDetailsDialogComponent>, public movementServie: MovementsService) {
		if(this.dialogRef.config.data){
			this.trip = Object.assign({}, this.dialogRef.config.data);
			this.title = 'Edit Trip Details';
		}
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