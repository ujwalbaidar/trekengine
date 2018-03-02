import { Component, OnInit } from '@angular/core';
import { AppService } from './app.service';
import { IMyOptions, IMyDateModel } from 'mydatepicker';
declare var jQuery:any;
import { MatSnackBar } from '@angular/material';

export class Traveler{
	firstName: string;
	middleName: string;
	lastName: string;
	gender: string;
	nationality: string;
	dob: any;
	permanentAddress: string;
	email: string;
	telephone: string;
		emergencyContact={} as {
		profile: string;
		name: string;
		number: string;
		relation: string;
	};
	airportPickup = {} as {
		confirmation: boolean;
		date: string;
		hrTime:string;
		minTime: string;
	};
	hotel = {} as {
		confirmation: boolean;
		name: string;
		number: string;
		relation: string;
	};
	messageBox: string;
}

export class Attachments {
		profile: string;
		passport: string;
		insurance: string;
}

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
	hrs: any;
	mins: any;
	traveler: Traveler = <Traveler>{};
	attachments: Attachments = <Attachments>{};
	submittedTravelerForm: Boolean = false;
	genders = [
	    {value: 'male', viewValue: 'male'},
	    {value: 'female', viewValue: 'female'}
	];
	countries: any;
	myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
        firstDayOfWeek: 'su',
        sunHighlight: false,
        editableDateField: false
    };
    submitProgress: Boolean = false;

	constructor(public appService: AppService, public snackBar: MatSnackBar){
		let timePicker = this.developTimePicker();
		this.hrs = timePicker.hrs;
		this.mins = timePicker.mins;
		this.traveler = <Traveler>{
			emergencyContact:{},
			airportPickup:{hrTime:this.hrs[0],minTime:this.mins[0]},
			hotel: {}
		};
	}

	ngOnInit(){
		this.getCountryLists();
		jQuery('#messageBox').val('New Text');
		jQuery('#messageBox').trigger('autoresize');
		this.traveler['gender'] = 'male';
	}

	selectTravelerGender(traveler, event){
		this.traveler['gender'] = event;
	}

	selectTravelerCountry(traveler, event){
		this.traveler['nationality'] = event;
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

	getCountryLists(){
		this.appService.getCountryLists()
			.subscribe(data=>{
				if(data.countries){
					this.countries = JSON.parse(data.countries);
				}
			}, error=>{
				let snackBarRef = this.snackBar.open('Failed to retrieve country list', '',{
					duration: 5000,
				});
			});
	}

	developTimePicker(){
		if(this.hrs === undefined){
			this.hrs = [];
			for(let i=0; i<24;i++){
				if(i<10){
					this.hrs.push('0'+i);
				}else{
					this.hrs.push(JSON.stringify(i));
				}
			}
		}

		if(this.mins === undefined){
					this.mins = [];
			for(let i=0; i<=55;i+=5){
				if(i<10){
					this.mins.push('0'+i);
				}else{
					this.mins.push(JSON.stringify(i));
				}
			}
		}
		let time = {hrs:this.hrs,mins:this.mins};
		return time;
	}

	removeAttachment(type: string){
		this.attachments[type] = '';
	}

	updateImage(event:any, uploadType: string){
		if (event.target.files && event.target.files[0]) {
		    var reader = new FileReader();
		    let fileData = event.target.files[0];
		    if(fileData.size <= 1000000){
		    	if(fileData.type === 'image/jpeg' || fileData.type === 'image/png'){
				    reader.onload = (event) => {
				    	this.attachments[uploadType] = event.target['result'];
						this.traveler[uploadType+'Attachment']['imageFile'] = event.target['result'];
				    }
				    this.traveler[uploadType+'Attachment'] = {
				    	name: fileData.name,
				    	size:fileData.size,
				    	type: fileData.type,
				    };
				    reader.readAsDataURL(event.target.files[0]);
		    	}else{
		    		let snackBarRef = this.snackBar.open('Only Jpeg/png files allowed', '',{
						duration: 5000,
					});
		    	}
		    }else{
		    	let snackBarRef = this.snackBar.open('Each file size must be less than 1Mb', '',{
						duration: 5000,
					});
		    }
		}
	}

	previewImage(){
		jQuery('.materialboxed').materialbox();
	}

	createTravelerDetails(travelerDetail:any){
		this.submittedTravelerForm = true;
		if(travelerDetail.valid){
			this.submitProgress = true;
			this.traveler['attachments'] = JSON.parse(JSON.stringify(this.attachments));
			this.appService.submitTravelerDetails(this.traveler)
				.subscribe(travelerCreateResp=>{
					if(travelerCreateResp.success == true){
						this.submitProgress = false;
						window.top.location.href = document.referrer;
					}else{
						this.submitProgress = false;
						let snackBarRef = this.snackBar.open(travelerCreateResp.msg, '',{
							duration: 5000,
						});
					}
				}, error=>{
					let snackBarRef = this.snackBar.open('Failed to save traveler details!!', '',{
						duration: 5000,
					});
				})
		}
	}
}
