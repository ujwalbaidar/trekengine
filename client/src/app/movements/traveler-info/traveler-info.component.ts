import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IMyOptions, IMyDateModel } from 'mydatepicker';
import { MovementsService, AuthService, UserService } from '../../services/index';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Traveler } from '../../models/models';
declare var jQuery:any;
import { MatSnackBar } from '@angular/material';
import { environment } from '../../../environments/environment';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

@Component({
	selector: 'app-traveler-info',
	providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }],
	templateUrl: './traveler-info.component.html',
	styleUrls: ['./traveler-info.component.css']
})
export class TravelerInfoComponent implements OnInit {
	public bookingId: String;
	public travelerId: String;
	public redirectPath: String;

	public travellerDetailUrl: SafeUrl;
	public getIframe: Boolean = false;
	public hrs: any;
	public mins: any;
	public traveler: Traveler = <Traveler>{};
	public genders = [
	    {value: 'male', viewValue: 'male'},
	    {value: 'female', viewValue: 'female'}
	];
	public myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
        firstDayOfWeek: 'su',
        sunHighlight: false,
        editableDateField: false
    };
    
    public submittedTravelerForm: Boolean = false;
    public submitProgress: Boolean = false;
    public countries: any;

	constructor(
		private route: ActivatedRoute,
		private _route:Router,
		private sanitizer: DomSanitizer,
		public movementService: MovementsService, 
		public auth: AuthService, 
		public userService: UserService,
		public snackBar: MatSnackBar,
		private location: Location
	) { 
		this.route.params.subscribe(params => {
			this.bookingId = params['bookingId'];
			if(params.travelerId){
				this.travelerId = params['travelerId'];
			}
			if(params['redirectPath']){
				this.redirectPath = params['redirectPath'];
			}
	    });
	    let timePicker = this.auth.developTimePicker();
		this.hrs = timePicker.hrs;
		this.mins = timePicker.mins;
		this.traveler = <Traveler>{emergencyContact:{}, airportPickup:{hrTime:this.hrs[0],minTime:this.mins[0]}, hotel:{}};
		/*this.traveler['tripGuideCount'] = 0;
		this.traveler['tripGuideDays'] = 0;
		this.traveler['tripGuidePerDayCost'] = 0;
		this.traveler['tripPoerterNumber'] = 0;
		this.traveler['tripPoerterDays'] = 0;
		this.traveler['tripPoerterPerDayCost'] = 0;
		this.traveler['tripTransportationCost'] = 0;
		this.traveler['tripAccomodationCost'] = 0;
		this.traveler['tripFoodCost'] = 0;
		this.traveler['tripPickupCost'] = 0;
		this.traveler['tripPermitCost'] = 0;
		this.traveler['tripFlightCost'] = 0;
		this.traveler['tripHotelCost'] = 0;*/
	}

	ngOnInit() {
		this.getCountryLists();
		jQuery('#messageBox').val('New Text');
		jQuery('#messageBox').trigger('autoresize');
		if(this.bookingId == undefined){
			if(this.travelerId == undefined){
				this.getIframe = true;
				this.travellerDetailUrl = this.sanitizer.bypassSecurityTrustResourceUrl(environment.webUrl+'/trekengineApp/travellers');
			}else{
				this.getTravelerInfo();
			}
		}else{
			if(this.travelerId == undefined){
				this.traveler['gender'] = 'male';
				this.traveler['imageAttachments'] = {};
			}else{
				this.getTravelerInfo();
			}
		}
	}

	getCountryLists(){
		this.userService.getCountryLists()
			.subscribe(data=>{
				if(data.countries){
					this.countries = JSON.parse(data.countries);
				}
			}, error=>{
				let snackBarRef = this.snackBar.open('Failed to retrieve country list', '', {
					duration: 5000,
				});
				snackBarRef.afterDismissed().subscribe(() => {
					this._route.navigate(['/app/bookings']);
				});
			})
	}

	getTravelerInfo(){
		this.movementService.queryTravelerDetails([{_id:this.travelerId}])
			.subscribe(travelerDetails=>{
				this.traveler = travelerDetails[0];
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

				if(this.traveler['attachments']){
					this.traveler['imageAttachments'] = JSON.parse(JSON.stringify(this.traveler['attachments']));
				}
				/*if(travelerDetails['travelerTripCost'] === undefined){
					this.traveler['tripGuideCount'] = 0;
					this.traveler['tripGuideDays'] = 0;
					this.traveler['tripGuidePerDayCost'] = 0;
					this.traveler['tripPoerterNumber'] = 0;
					this.traveler['tripPoerterDays'] = 0;
					this.traveler['tripPoerterPerDayCost'] = 0;
					this.traveler['tripTransportationCost'] = 0;
					this.traveler['tripAccomodationCost'] = 0;
					this.traveler['tripFoodCost'] = 0;
					this.traveler['tripPickupCost'] = 0;
					this.traveler['tripPermitCost'] = 0;
					this.traveler['tripFlightCost'] = 0;
					this.traveler['tripHotelCost'] = 0;
				}*/
			}, error=>{
				let snackBarRef = this.snackBar.open('Failed to get Traveler Information to edit', '', {
					duration: 5000,
				});
				snackBarRef.afterDismissed().subscribe(() => {
					this._route.navigate(['/app/movements/traveller-details']);
				});
			})
	}

	selectTravelerGender(traveler, event){
		this.traveler['gender'] = event;
	}

	selectTravelerCountry(traveler, event){
		this.traveler['nationality'] = event;
	}

	submitTravelerDetails(travelerDetail:any){
		this.submittedTravelerForm = true;
		if(travelerDetail.valid){
			this.submitProgress = true;
			if(this.bookingId){
				this.traveler['bookingId'] = this.bookingId;
			}
			if(this.travelerId){
				this.updateTravelerDetails();
			}else{
				this.createTravelerDetails();
			}
		}
	}

	createTravelerDetails(){
		this.movementService.submitTravelerDetails(this.traveler)
			.subscribe(createResponse=>{
				let snackBarRef = this.snackBar.open('Traveler Information Created Successfully!', '', {
					duration: 3000,
				});
				snackBarRef.afterDismissed().subscribe(() => {
					this._route.navigate([`/app/bookings/booking-details/${this.bookingId}`]);
				});
			}, createError=>{
				this.submittedTravelerForm = false;
				this.submitProgress = false;
				let snackBarRef = this.snackBar.open('Failed to update Traveler Information', '', {
					duration: 5000,
				});
				snackBarRef.afterDismissed().subscribe(() => {
					location.reload();
				});
			});
	}

	updateTravelerDetails(){
		this.movementService.updateTravelerDetails(this.traveler)
			.subscribe(updateResponse=>{
				let snackBarRef = this.snackBar.open('Traveler Information Updated Successfully!', '', {
					duration: 3000,
				});
				snackBarRef.afterDismissed().subscribe(() => {
					if(this.redirectPath == 'booking-details'){
						this._route.navigate(['/app/bookings/booking-details/', this.bookingId]);
					}else{
						this._route.navigate(['/app/movements/traveller-details']);
					}
				});
			}, updateError=>{
				this.submittedTravelerForm = false;
				this.submitProgress = false;
				let snackBarRef = this.snackBar.open('Failed to update Traveler Information', '', {
					duration: 5000,
				});
			});
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
		    	if(fileData.type === 'image/jpeg' || fileData.type === 'image/png'){
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
		    		this.snackBar.open('Only Jpeg/png files allowed', '', {
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
