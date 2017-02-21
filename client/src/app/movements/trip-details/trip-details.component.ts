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
	constructor(private _route: Router, public dialog: MdDialog){}
	ngOnInit(){}

	openAddTripModal(){
		let dialogRef = this.dialog.open(TripDetailsDialogComponent, {
			height: '600px',
  			width: '600px',
  			position: 'center',
  			disableClose: true
		});
    	dialogRef.afterClosed().subscribe(result => {
      		this.selectedOption = result;
    	});
	}
}

@Component({
	selector: 'trip-details-dialog',
	templateUrl: './src/app/movements/trip-details/trip-details-dialog.html',
})
export class TripDetailsDialogComponent {
	trip: Trip = <Trip>{};

	private myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd.mm.yyyy',
    };

	constructor(public dialogRef: MdDialogRef<TripDetailsDialogComponent>, public movementServie: MovementsService) {
	}

	submitTrekDetails() {
		this.movementServie.submitTripDetails(this.trip)
		.subscribe(
					tripsDetail=>{
						debugger;
						// this.submitted = false;
						// this.successMessage = "Registered Successfully!";
						// setTimeout(()=>{ 
						// 	this._route.navigate(['/login']);
						// }, 3000);
					}, error=>{
						// if(error.errBody.data && error.errBody.data.code === 11000){
						// 	this.errMessage = "Email Already Exists!";
						// }else{
						// 	this.errMessage = "Failed to Register User!";
						// }
						// setTimeout(()=>{ 
						// 	this.errMessage = "";
						// }, 3000);
					});
	}
}