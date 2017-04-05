import { Component, OnInit } from '@angular/core';
import { PackageBillingsService, AuthService } from '../services';
import { FeaturePackage } from '../models/models';


@Component({
  selector: 'app-package-billings',
  templateUrl: './package-billings.component.html',
  styleUrls: ['./package-billings.component.css']
})
export class PackageBillingsComponent implements OnInit {

  	packages:any;
	packageErr: any;
	constructor(private packageBillingsService:PackageBillingsService, private auth:AuthService) { }

	ngOnInit() {
		this.getPackages();
	}

  	getPackages(){
  		this.packageBillingsService.getPackages()
  			.then(packages=>{
  				this.packages = packages;
  			});
  	}

  	selectPackage(featurePackage:FeaturePackage=<FeaturePackage>{}){
  		this.auth.getCookies()
			.then(cookieObj=>{
				if(cookieObj && cookieObj["authToken"] !== undefined && cookieObj["authToken"].length>0){
					this.packageBillingsService.submitPackage(featurePackage)
						// .subscribe(packageInfo=>{
						// 	// this.bookings.splice(index,1);
						// }, error => {
						// 	this.packageErr = 'Failed to Setup Package';
						// });
				}
			});
  	}

}
