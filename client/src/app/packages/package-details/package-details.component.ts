import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { AppPackage } from '../../models/models';
import { PackagesService, FeaturesService } from '../../services';
declare var jQuery:any;

@Component({
  selector: 'app-package-details',
  templateUrl: './package-details.component.html',
  styleUrls: ['./package-details.component.css']
})
export class PackageDetailsComponent implements OnInit {
	appPackage: AppPackage = <AppPackage>{};
	appFeatures: any;
	title: string = 'Add Package Details';
	packageDetailErr:any;
	selectedFeature: any;
	selectedFeatureArrIds: any;
	selectedFeatureArr: any;
	packageId:string;
	submittedPackageForm: boolean = false;
	submitOnProgress: boolean = false;

	constructor(
		private _route:Router, 
		private route: ActivatedRoute, 
		public packageService: PackagesService, 
		public featuresService:FeaturesService
	){
		jQuery('select').material_select();
	}

	ngOnInit(){
		this.getFeataures();
		this.route.params.subscribe(params => {
			this.packageId = params['packageId'];
			if(this.packageId){
				this.title = 'Edit Package Details';
				this.getPackageByQuery();
			}
	    });
	}

	getPackageByQuery(){
		this.packageService.getAppPackageDetail([{_id:this.packageId}])
			.subscribe(appPackage=>{
					this.appPackage = appPackage[0];
					this.selectedFeatureArrIds = appPackage[0]['featureIds'];
					if(this.selectedFeatureArr == undefined){
						this.selectedFeatureArr = [];
					}
					this.appFeatures.filter(val=>{
		 				if(this.selectedFeatureArrIds.includes(val._id)){
		 					this.selectedFeatureArr.push(val);
		 				}
		 			});
				},error=>{
					this.packageDetailErr = error;
				});
	}

	getFeataures(){
		this.featuresService.getAppFeature()
			.subscribe(packageFeatures=>{
				this.appFeatures = packageFeatures;
			},error=>{
				this.packageDetailErr = error;
			});
	}

	addFeature(){
		if(this.selectedFeatureArr == undefined){
			this.selectedFeatureArr = [];
			this.selectedFeatureArrIds = [];
		}
	 	if (this.selectedFeatureArrIds.includes(this.selectedFeature) == false) {
 			this.selectedFeatureArrIds.push(this.selectedFeature);
 			this.appFeatures.filter(val=>{
 				if(val._id == this.selectedFeature){
 					this.selectedFeatureArr.push(val);
 				}
 			});
		} 
	}

	removePackageFeature(indx){
		this.selectedFeatureArr.splice(indx, 1);
		this.selectedFeatureArrIds.splice(indx, 1);
	}

	submitAppPackages(packageForm:any){
		this.submittedPackageForm = true;
		if(packageForm.valid){
			this.submitOnProgress = true;
			if(this.packageId){
				this.updatePackageDetails();
			}else{
				this.savePackageDetails();
			}
		}
	}

	updatePackageDetails(){
		this.packageService.updateAppPackage(this.appPackage)
			.subscribe(appPackage=>{
				this._route.navigate(['/app/app-packages']);
			}, error=>{
				this.selectedFeatureArr = error;
			});
	}

	savePackageDetails(){
		if(this.selectedFeatureArrIds !== undefined && this.selectedFeatureArrIds.length>0){
			this.appPackage['featureIds'] = this.selectedFeatureArrIds;
		}
		this.packageService.submitAppPackage(this.appPackage)
			.subscribe(appPackage=>{
				this._route.navigate(['/app/app-packages']);
			}, error=>{
				this.selectedFeatureArr = error;
			});
	}
}
