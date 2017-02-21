import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { Trip } from './trip-details.model';

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
	constructor(public dialogRef: MdDialogRef<TripDetailsDialogComponent>) {
	}
}