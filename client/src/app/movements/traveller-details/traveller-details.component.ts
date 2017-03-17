import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { IMyOptions, IMyDateModel } from 'mydatepicker';
import { MovementsService } from '../../services/index';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Traveler } from '../../models/models';
declare var jQuery:any;

@Component({
    selector: 'traveller-details',
    templateUrl: './src/app/movements/traveller-details/traveller-details.component.html'
})
export class TravellerDetailsComponent implements OnInit {
	traveler: Traveler = <Traveler>{};
	travelers: any;

	constructor(
		private _route: Router, 
		public dialog: MdDialog, 
		public movementServie: MovementsService
	){
		jQuery('.materialboxed').materialbox();
	}
	
	ngOnInit(){
		this.getTravelerDetails();
	}

	getTravelerDetails() {
		this.movementServie.getTravelerDetails()
		.subscribe(travelers=>{
				this.travelers = travelers;
			}, error=>{
				console.log(error);
			});
	}
	
	openTravellerModal(data:Traveler=<Traveler>{}, actionMode:string) {
		let dialogOptions = {
			height: '600px',
  			width: '600px',
  			position: 'center',
  			disableClose: true
		};
		dialogOptions["data"] = {};
		dialogOptions["data"]["mode"] = actionMode;

		if(JSON.stringify(data) !== '{}'){
			dialogOptions["data"]["travelerInfo"] = data;
		};

		let dialogRef = this.dialog.open(TravellerDetailsDialogComponent, dialogOptions);
    	dialogRef.afterClosed().subscribe(result => {
      		this.getTravelerDetails();
    	});
	}

	deleteTravelerDetails(travelerId:string, index:number) {
		this.movementServie.deleteTravelerDetails(travelerId)
		.subscribe(deleteRes=>{
				this.travelers.splice(index, 1);
			}, deleteError=>{
				console.log(deleteError);
			});
	}
}

@Component({
	selector: 'traveller-details-dialog',
	templateUrl: './src/app/movements/traveller-details/traveller-details-dialog.html',
})
export class TravellerDetailsDialogComponent implements OnInit {
	travellerDetailUrl: SafeUrl;
	actionMode: string;
	traveler: Traveler = <Traveler>{};

	constructor(public dialogRef: MdDialogRef<TravellerDetailsDialogComponent>, private sanitizer: DomSanitizer, public movementService: MovementsService){
		this.actionMode = this.dialogRef.config.data.mode;
		if(this.dialogRef.config.data.travelerInfo){
			this.traveler = Object.assign({}, this.dialogRef.config.data.travelerInfo);
		}
	}

	ngOnInit(){
		this.travellerDetailUrl = this.sanitizer.bypassSecurityTrustResourceUrl('http://localhost:5000/app/travellers');
	}

	submitTravelerDetails(travelerDetail:any){
		if(travelerDetail.valid){
			this.movementService.updateTravelerDetails(this.traveler)
				.subscribe(updateResponse=>{
					this.dialogRef.close(updateResponse);
				}, updateError=>{
					this.dialogRef.close(updateError);
				});
		}
	}

	submitPickupConfirmation(isChecked:boolean){
		if(isChecked){
			this.traveler['airportPickup']['confirmation'] = false;
		}else{
			this.traveler['airportPickup']['confirmation'] = true;
		}
	}

	previewImage(){
		jQuery('.materialboxed').materialbox();
	}
}