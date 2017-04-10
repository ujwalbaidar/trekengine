import { Component, OnInit } from '@angular/core';
import { PackageBillingsService, AuthService, UserService } from '../services';
import { FeaturePackage } from '../models/models';
import { CookieService } from 'angular2-cookie/core';


@Component({
  selector: 'app-package-billings',
  templateUrl: './package-billings.component.html',
  styleUrls: ['./package-billings.component.css']
})
export class PackageBillingsComponent implements OnInit {
	loggedIn: boolean;
  	packageDetails:any;
	packageErr: any;
	users: any;
	selectedBillingUser: any;

	constructor(private packageBillingsService:PackageBillingsService, private auth:AuthService, private _cookieService:CookieService, private userService:UserService) { }

	ngOnInit() {
		let cookieVal = this._cookieService.getAll();
		if(cookieVal['authToken'] && cookieVal['authToken'].length>0){
			this.loggedIn = true;
			if(parseInt(cookieVal['idx'])===10){
				this.getUsers();
			}
		}
		this.getPackages();
	}

  	getPackages(){
  		this.packageBillingsService.getPackages()
  			.subscribe(packageDetails=>{
  				this.packageDetails = packageDetails;
  			}, error=>{
  				this.packageErr = 'Failed to retrive package billings';
  			})
  	}

  	getUsers(){
  		this.userService.findByQuery([{role:20},{status:true}])
			.subscribe(users=>{
				this.users = users;
			}, error=>{
				this.packageErr = 'Failed to get users';
			})
  	}

  	selectPackage(featurePackage:FeaturePackage=<FeaturePackage>{}){
  		this.auth.getCookies()
			.then(cookieObj=>{
				if(cookieObj && cookieObj["authToken"] !== undefined && cookieObj["authToken"].length>0){
					if(parseInt(cookieObj['idx'])===10){
						if(this.selectedBillingUser!==undefined){
							featurePackage['selectedBillingUser']=this.selectedBillingUser;
							let filterEmail = this.users.filter(user=>{
								if(user._id == this.selectedBillingUser){
									return user;
							    }
							});
							featurePackage['selectedBillingUserEmail']=filterEmail[0]['email'];
							this.packageBillingsService.submitPackage(featurePackage)
								.subscribe(packageInfo=>{
									this.selectedBillingUser = undefined;
									alert(packageInfo);
								}, error => {
									this.packageErr = 'Failed to Setup Package';
								});
						}else{
							alert('User Not selected for Billing');
						}
					}else{
						this.packageBillingsService.submitPackage(featurePackage)
							.subscribe(packageInfo=>{
								alert(packageInfo);
							}, error => {
								this.packageErr = 'Failed to Setup Package';
							});
					}
				}
			});
  	}

}
