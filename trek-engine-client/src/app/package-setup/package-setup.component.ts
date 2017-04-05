import { Component, OnInit } from '@angular/core';
import { PackageService, AuthService } from '../services';
// import { FeaturePackage } from '../models/models';
import { FeaturePackage } from '../models/models';

@Component({
  selector: 'app-package-setup',
  templateUrl: './package-setup.component.html',
  styleUrls: ['./package-setup.component.css']
})
export class PackageSetupComponent implements OnInit {
	packages:any;
	packageErr: any;
	constructor(private packageService:PackageService, private auth:AuthService) { }

	ngOnInit() {
		this.getPackages();
	}

  	getPackages(){
  		this.packageService.getPackages()
  			.then(packages=>{
  				this.packages = packages;
  			});
  	}

  	selectPackage(featurePackage:FeaturePackage=<FeaturePackage>{}){
  		this.auth.getCookies()
			.then(cookieObj=>{
				if(cookieObj && cookieObj["authToken"] !== undefined && cookieObj["authToken"].length>0){
					this.packageService.submitPackage(featurePackage)
						// .subscribe(packageInfo=>{
						// 	// this.bookings.splice(index,1);
						// }, error => {
						// 	this.packageErr = 'Failed to Setup Package';
						// });
				}
			});
  	}
}
