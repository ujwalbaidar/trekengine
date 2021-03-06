import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { IMyOptions, IMyDateModel } from 'mydatepicker';
import { MovementsService, AuthService, ExportReportService } from '../../services/index';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Traveler } from '../../models/models';
declare var jQuery:any;
import { MatSnackBar } from '@angular/material';
import { environment } from '../../../environments/environment';
import { DeleteConfimationDialogComponent } from '../../delete-confimation-dialog/delete-confimation-dialog.component';

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
		public dialog: MatDialog, 
		public movementServie: MovementsService,
		public exportReportService:ExportReportService
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
		let dialogOptions = {
  			width: '600px',
  			disableClose: true
		};

		dialogOptions["data"] = {};
		
		let dialogRef = this.dialog.open(DeleteConfimationDialogComponent, dialogOptions);
	    	dialogRef.afterClosed().subscribe(result => {
	    		let selectedOption = parseInt(result);
    			if(selectedOption == 1){
					this.movementServie.deleteTravelerDetails(travelerId)
						.subscribe(deleteRes=>{
								this.travelers.splice(index, 1);
							}, deleteError=>{
								console.log(deleteError);
							});
    			}
			});
		
	}

	exportCsv(){
		this.exportReportService.exportTravelerDetails()
			.subscribe(csvDataObj=>{
				var data, filename, link;
		        var csv = this.exportReportService.convertArrayOfObjectsToCSV({
		            data: csvDataObj
		        });
		    
		        if (csv == null) return;
		        filename = 'booking-report.csv';

		        if (!csv.match(/^data:text\/csv/i)) {
		            csv = 'data:text/csv;charset=utf-8,' + csv;
		        }
		        data = encodeURI(csv);

		        link = document.createElement('a');
		        link.setAttribute('href', data);
		        link.setAttribute('download', filename);
		        link.click();
			}, error=>{
				console.log(error)
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
	submittedTravelerForm:Boolean = false;
	submitProgress:Boolean = false;

	public myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
        firstDayOfWeek: 'su',
        sunHighlight: false,
        editableDateField: false
    };

	public genders = [
	    {value: 'male', viewValue: 'Male'},
	    {value: 'female', viewValue: 'Female'}
	];

	constructor(
		public dialogRef: MatDialogRef<TravellerDetailsDialogComponent>, 
		@Inject(MAT_DIALOG_DATA) public data: any,
		private sanitizer: DomSanitizer, 
		public movementService: MovementsService, 
		public auth: AuthService, 
		public snackBar: MatSnackBar
	){
		let dialogConfigData = data;
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
			this.traveler['bookingId'] =  data.bookingId;
			this.traveler['gender'] = 'male';
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
		this.travellerDetailUrl = this.sanitizer.bypassSecurityTrustResourceUrl(environment.webUrl+'/trekengineApp/travellers');
	}

	selectTravelerGender(traveler, event){
		this.traveler['gender'] = event;
	}

	submitTravelerDetails(travelerDetail:any){
		this.submittedTravelerForm = true;
		let dialogConfigData = this.data;
		if(travelerDetail.valid){
			this.submitProgress = true;
			if(dialogConfigData.records){
				this.movementService.updateTravelerDetails(this.traveler)
					.subscribe(updateResponse=>{
						this.submitProgress = false;
						this.submittedTravelerForm = false;
						this.dialogRef.close(this.traveler);
					}, updateError=>{
						this.submitProgress = false;
						this.dialogRef.close(updateError);
					});
			}else{
				this.movementService.submitTravelerDetails(this.traveler)
					.subscribe(updateResponse=>{
						this.submitProgress = false;
						this.submittedTravelerForm = false;
						this.dialogRef.close(this.traveler);
					}, updateError=>{
						this.submitProgress = false;
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
		    let fileData = event.target.files[0];
		    if(fileData.size <= 1000000){
		    	if(fileData.type === 'image/jpeg'){
				    reader.onload = (event) => {
				    	if(this.traveler['attachments'] == undefined){
				    		this.traveler['attachments'] = {};
				    	}
				    	this.traveler['attachments'][uploadType] = event.target['result'];
						this.traveler[uploadType+'Attachment']['imageFile'] = event.target['result'];
				    }
				    this.traveler[uploadType+'Attachment'] = {
				    	name: fileData.name,
				    	size:fileData.size,
				    	type: fileData.type,
				    };
				    reader.readAsDataURL(event.target.files[0]);
		    	}else{
		    		this.snackBar.open('Only .jpg extension is allowed', '', {
						duration: 5000,
					});
		    	}
		    }else{
		    	this.snackBar.open('Each file size must be less than 1Mb', '', {
					duration: 5000,
				});
		    }
		}
	}

	previewImage(){
		jQuery('.materialboxed').materialbox();
	}
}
