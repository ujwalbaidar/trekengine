import { Component, OnInit } from '@angular/core';
import { PackageBillingsService, AuthService } from '../services';
import { FeaturePackage } from '../models/models';


@Component({
  selector: 'app-package-billings',
  templateUrl: './package-billings.component.html',
  styleUrls: ['./package-billings.component.css']
})
export class PackageBillingsComponent implements OnInit {

  	packageDetails:any;
	packageErr: any;
	constructor(private packageBillingsService:PackageBillingsService, private auth:AuthService) { }

	ngOnInit() {
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

  	selectPackage(featurePackage:FeaturePackage=<FeaturePackage>{}){
  		this.auth.getCookies()
			.then(cookieObj=>{
				if(cookieObj && cookieObj["authToken"] !== undefined && cookieObj["authToken"].length>0){
					this.packageBillingsService.submitPackage(featurePackage)
						.subscribe(packageInfo=>{
							alert(packageInfo);
						}, error => {
							this.packageErr = 'Failed to Setup Package';
						});
				}
			});
  	}

}
