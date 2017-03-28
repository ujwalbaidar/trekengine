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
			this.traveler['imageAttachments'] = {};
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
			if(this.traveler['attachments'] != undefined){
				this.traveler['imageAttachments'] = Object.assign({}, this.traveler['attachments']);
			}
			// if(this.traveler.emergencyContact != undefined){
			// 	this.traveler['emergencyContactName'] = this.traveler.emergencyContact.name;
			// 	this.traveler['emergencyContactNumber'] = this.traveler.emergencyContact.number;
			// 	this.traveler['emergencyContactRelation'] = this.traveler.emergencyContact.relation;
			// }
		}else{
			this.traveler = <Traveler>{emergencyContact:{},airportPickup:{},hotel:{}};
			this.traveler['bookingId'] =  this.dialogRef.config.data.bookingId;
		}
	}

	ngOnInit(){
		this.travellerDetailUrl = this.sanitizer.bypassSecurityTrustResourceUrl('http://localhost:5000/app/travellers');
	}

	submitTravelerDetails(travelerDetail:any){
		if(travelerDetail.valid){
			if(this.dialogRef.config.data.travelerInfo){
				this.movementService.updateTravelerDetails(this.traveler)
					.subscribe(updateResponse=>{
						this.dialogRef.close(this.traveler);
					}, updateError=>{
						this.dialogRef.close(updateError);
					});
			}else{
				this.movementService.submitTravelerDetails(this.traveler)
					.subscribe(updateResponse=>{
						this.dialogRef.close(this.traveler);
					}, updateError=>{
						this.dialogRef.close(updateError);
					});
			}
		}
	}

	submitPickupConfirmation(isChecked:boolean){
		if(isChecked){
			this.traveler['airportPickup']['confirmation'] = false;
		}else{
			this.traveler['airportPickup']['confirmation'] = true;
		}
	}

	submitHotelConfirmation(isChecked:boolean){
		if(isChecked){
			this.traveler['hotel']['confirmation'] = false;
		}else{
			this.traveler['hotel']['confirmation'] = true;
		}
	}

	removeAttachment(type: string){
		this.traveler['attachments'][type] = '';
	}

	updateImage(event:any, uploadType: string){
		if (event.target.files && event.target.files[0]) {
		    var reader = new FileReader();

		    reader.onload = (event) => {
		    	if(this.traveler['attachments'] == undefined){
		    		this.traveler['attachments'] = {};
		    	}
		    	this.traveler['attachments'][uploadType] = event.target['result'];
				this.traveler[uploadType+'Attachment']['imageFile'] = event.target['result'];
		    }
		    let fileData = event.target.files[0];
		    this.traveler[uploadType+'Attachment'] = {
		    	name: fileData.name,
		    	size:fileData.size,
		    	type: fileData.type,
		    };
		    reader.readAsDataURL(event.target.files[0]);
		}
	}

	previewImage(){
		jQuery('.materialboxed').materialbox();
	}
}