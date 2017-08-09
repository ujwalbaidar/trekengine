import { Component, OnInit } from '@angular/core';
import { MovementsService } from '../../services';
import { MdDialog, MdDialogRef } from '@angular/material';
import { TravellerDetailsDialogComponent } from '../index';
@Component({
  selector: 'app-airport-pickup-details',
  templateUrl: './airport-pickup-details.component.html',
  styleUrls: ['./airport-pickup-details.component.css']
})
export class AirportPickupDetailsComponent implements OnInit {
	public pickupDetails;
	public pickupInfosErr:any;

	constructor(public movementsService:MovementsService, public dialog: MdDialog,) { }

	ngOnInit() {
		this.getPickupDetails();
	}

	getPickupDetails(){
		this.movementsService.getAirportPickupsInfo()
			.subscribe(pickupInfos=>{
				this.pickupDetails = pickupInfos;
			}, error=>{
				this.pickupInfosErr = error;
			});
	}

	openTravellerModal(data:any, actionMode:string) {
		let dialogOptions = {
			height: '600px',
  			width: '600px',
  			position: 'center',
  			disableClose: true
		};
		dialogOptions["data"] = {};
		dialogOptions["data"]["mode"] = 'view';

		if(JSON.stringify(data) !== '{}'){
			dialogOptions["data"]["records"] = data;
		};

		let dialogRef = this.dialog.open(TravellerDetailsDialogComponent, dialogOptions);
	}
}
