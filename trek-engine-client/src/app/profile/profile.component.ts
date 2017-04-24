import { Component, OnInit } from '@angular/core';
import { UserService } from '../services';
import { IMyOptions, IMyDateModel } from 'mydatepicker';
import { ProfilePassword } from '../models/models';
import { AuthService } from '../services';
import { MdSnackBar } from '@angular/material';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
	profile: any;
	userInfo: any;
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
	
	constructor(public userService: UserService, public authService: AuthService, public snackBar: MdSnackBar) { }

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
				this.userInfo = Object.assign({},userInfo);
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
}
