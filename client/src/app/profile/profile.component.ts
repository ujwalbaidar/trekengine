import { Component, OnInit } from '@angular/core';
import { UserService } from '../services';
import { IMyOptions, IMyDateModel } from 'mydatepicker';
import { ProfilePassword } from '../models/models';
import { AuthService } from '../services';
import { MatSnackBar } from '@angular/material';
import { User } from '../models/models';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
	profile: any;
	userInfo: User = <User>{domain:{website:'', protocol:''}};
	// userInfo: any;
	userErr: any;
	displayContent:boolean=true;
	showPasswordForm:boolean=false;
	submittedPasswordForm:boolean=false;

	genders = [
	    {value: 'male', viewValue: 'Male'},
	    {value: 'female', viewValue: 'Female'}
	];
	private myDatePickerOptions: IMyOptions = {
        dateFormat: 'dd-mm-yyyy',
        firstDayOfWeek: 'su',
        sunHighlight: false,
        editableDateField: false
    };
	
	public profilePassword: ProfilePassword;
	
	protocols = [
		{ 'id': '1', 'name': 'http', 'value': 'http://'},
		{ 'id': '2', 'name': 'https', 'value': 'https://'}
	];
	selectedProtocol: string;
	authUrls =  [];
	hrs: any;
	mins: any;
	submittedForm: boolean = false;
	travelerIframeUrl: string;
	timezones: any;
	userTimezone: any;

	constructor(public userService: UserService, public authService: AuthService, public snackBar: MatSnackBar) {
		let timePicker = this.authService.developTimePicker();
		timePicker.hrs.push("24");
		this.hrs = timePicker.hrs;
		this.mins = timePicker.mins;
	}

	ngOnInit() {
		this.travelerIframeUrl = environment.webUrl+'/trekengineApp/travellers';
		if(window.name && window.name == 'GoogleAuth'){
		 	window.opener.location.reload();
			window.close();
		}
		this.profilePassword = {
			userPassword: '',
			confirmPassword: ''
		};
		this.getUserInfo();
		this.getOauthUrl();
	}

	getTimezoneList(){
		this.userService.getTimezoneList()
			.subscribe(timezoneData=>{
				this.timezones = timezoneData.timezone;
			});
	}

	getUserInfo(){
		this.userService.getUserInfo()
			.subscribe(userInfo=>{
				this.userInfo = JSON.parse(JSON.stringify(userInfo));
				if(this.userInfo['domain'] == undefined){
					this.userInfo['domain'] = JSON.parse(JSON.stringify({domain:'http://', website:''}));
				}
				this.userInfo['timezone'] = JSON.parse(JSON.stringify(userInfo.timezone.zoneName));
				this.userInfo['gmtValue'] = JSON.parse(JSON.stringify(userInfo.timezone.gmtValue));
				this.profile = JSON.parse(JSON.stringify(userInfo));
			}, error=>{
				this.userErr = error;
			});
	}

	getOauthUrl(){
		this.userService.getOauthUrls()
			.subscribe(authUrls=>{
				this.authUrls = authUrls;
			});
	}

	redirectOauthUrl(url:string){
		window.open(url, "GoogleAuth", "width=600,height=600");
	}

	submitProfileInfo(option:String, profileForm:any){
		if(option==='opt-cancel'){
			this.displayContent = true;
			this.getUserInfo();
			// this.userInfo = Object.assign({}, this.profile);
		}else{
			this.submittedForm = true;
			if(profileForm.valid){
				let userTimezone = this.timezones.find(timezoneObj=>{
					if(timezoneObj.zoneName == this.userInfo['timezone']){
						return timezoneObj;
					}
				});
				this.userInfo.timezone = JSON.parse(JSON.stringify(userTimezone));
				this.userService.updateUserInfo(this.userInfo)
					.subscribe(updateData=>{
						this.submittedForm = false;
						this.displayContent = true;
						this.getUserInfo();
					}, error=>{
						this.userErr = error;
					});
			}
		}
	}

	toggleDailyNotification(notification:boolean){
		if (notification==true) {
			this.profile['dailyTripNotification'] = false;
		}else{
			this.profile['dailyTripNotification'] = true;
		}
		this.updateUserProfile(this.profile);
	}

	toggleWeeklyNotification(notification:boolean){
		if (notification==true) {
			this.profile['weeklyTripNotification'] = false;
		}else{
			this.profile['weeklyTripNotification'] = true;
		}
		this.updateUserProfile(this.profile);
	}

	updateUserProfile(userDataObj: object, changeValue: string = '',  changeType: string = ''){
		if(changeType && changeType.length>0){
			userDataObj['calendarNotification'][changeType] = changeValue
		}
		this.userService.updateUserInfo(userDataObj)
			.subscribe(updateData=>{
				this.getUserInfo();
			}, error=>{
				this.userErr = error;
			});
	}

	submitPasswordInfo(option:string, passwordForm:any, passwordData: object){
		if(option==='opt-cancel'){
			this.showPasswordForm = false;
			this.profilePassword = { userPassword:'', confirmPassword: ''};
		}else{
			this.submittedPasswordForm = true;
			if(passwordForm.valid){
				this.userService.updateUserPassword(passwordForm.value)
					.subscribe(updateData=>{
    					setTimeout(()=>{ 
    						this.authService.logout();
						}, 2000);
						this.snackBar.open('Password updated successfully! Please Login Again!', '', {
      						duration: 2000,
    					});
					}, error=>{
						this.userErr = error;
					});
			}
		}
	}

	switchEditMode(){
		this.displayContent=false;
		this.getTimezoneList();
	}
}
