import { Component, OnInit } from '@angular/core';
import { UserService } from '../services';
import { IMyOptions, IMyDateModel } from 'mydatepicker';
import { ProfilePassword } from '../models/models';
import { AuthService } from '../services';
import { MdSnackBar } from '@angular/material';
import { User } from '../models/models';

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
	    {value: 'female', viewValue: 'Memale'},
	    {value: 'others', viewValue: 'Others'}
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

	constructor(public userService: UserService, public authService: AuthService, public snackBar: MdSnackBar) {
	}

	ngOnInit() {
		this.profilePassword = {
			userPassword: '',
			confirmPassword: ''
		};
		this.getUserInfo();
	}

	getUserInfo(){
		this.userService.getUserInfo()
			.subscribe(userInfo=>{
				this.userInfo = JSON.parse(JSON.stringify(userInfo));
				if(this.userInfo['domain'] == undefined){
					this.userInfo['domain'] = JSON.parse(JSON.stringify({domain:'http://', website:''}));
				}
				this.profile = userInfo;
			}, error=>{
				this.userErr = error;
			});
	}

	submitProfileInfo(option:String, profileForm:any){
		if(option==='opt-cancel'){
			this.displayContent = true;
			this.userInfo = Object.assign({}, this.profile);
		}else{
			if(profileForm.valid){
				this.userService.updateUserInfo(this.userInfo)
					.subscribe(updateData=>{
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

	updateUserProfile(userDataObj: object){
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
	}
}
