import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { IMyOptions, IMyDateModel } from 'mydatepicker';
import { MovementsService, AuthService } from '../../services/index';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Traveler } from '../../models/models';
declare var jQuery:any;

@Component({
  selector: 'traveler-details',
  templateUrl: './traveller-details.component.html',
  styleUrls: ['./traveller-details.component.css']
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
	
	openTravellerModal(data:any, actionMode:string) {
		let dialogOptions = {
			height: '600px',
  			width: '600px',
  			position: 'center',
  			disableClose: true
		};
		dialogOptions["data"] = {};
		dialogOptions["data"]["mode"] = actionMode;

		if(JSON.stringify(data) !== '{}'){
			dialogOptions["data"]["records"] = data;
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
	templateUrl: './traveller-details-dialog.html',
})
export class TravellerDetailsDialogComponent implements OnInit {
	travellerDetailUrl: SafeUrl;
	actionMode: string;
	traveler: Traveler = <Traveler>{};
	title: string;
	hrs: any;
	mins: any;

	constructor(public dialogRef: MdDialogRef<TravellerDetailsDialogComponent>, private sanitizer: DomSanitizer, public movementService: MovementsService, public auth: AuthService){
		let dialogConfigData = this.dialogRef._containerInstance.dialogConfig.data;
		this.actionMode = dialogConfigData.mode;
		let timePicker = this.auth.developTimePicker();
		this.hrs = timePicker.hrs;
		this.mins = timePicker.mins;
		this.traveler = <Traveler>{emergencyContact:{}, airportPickup:{hrTime:this.hrs[0],minTime:this.mins[0]}, hotel:{}};
		if(dialogConfigData.records){
			this.traveler = JSON.parse(JSON.stringify(dialogConfigData.records));
			if(this.actionMode == 'edit'){
				this.title = 'Edit Traveler Details';
				if(this.traveler['emergencyContact']==undefined){
					this.traveler['emergencyContact']={
						name: '',
						number: '',
						relation: ''
					};
				}
				if(this.traveler['emergencyContact']['name']==undefined){
					this.traveler['emergencyContact']['name'] = '';
				}
				if(this.traveler['emergencyContact']['number']==undefined){
					this.traveler['emergencyContact']['number'] = '';
				}
				if(this.traveler['emergencyContact']['relation']==undefined){
					this.traveler['emergencyContact']['relation'] = '';
				}
				if(this.traveler['airportPickup']['hrTime'] == undefined){
					this.traveler['airportPickup']['hrTime']=this.hrs[0];
				}
				if(this.traveler['airportPickup']['minTime'] == undefined){
					this.traveler['airportPickup']['minTime']=this.mins[0];
				}
				if(this.traveler['attachments'] != undefined){
					this.traveler['imageAttachments'] = JSON.parse(JSON.stringify(this.traveler['attachments']));
				}
			}
		}else{
			this.title = 'Add Traveler Details';
			this.traveler['bookingId'] =  this.dialogRef._containerInstance.dialogConfig.data.bookingId;
			if(this.traveler['airportPickup'] == undefined){
				this.traveler['airportPickup'] = {
					confirmation: false,
					date: '',
					hrTime:this.hrs[0],
					minTime:this.mins[0]
				}
			}
		}
	}

	ngOnInit(){
		this.travellerDetailUrl = this.sanitizer.bypassSecurityTrustResourceUrl('http://localhost:5000/trekengineApp/travellers');
	}

	submitTravelerDetails(travelerDetail:any){
		let dialogConfigData = this.dialogRef._containerInstance.dialogConfig.data;
		if(travelerDetail.valid){
			if(dialogConfigData.records){
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
