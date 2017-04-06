import { Component, OnInit } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { AppFeatures } from '../models/models';
import { FeaturesService } from '../services';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css']
})
export class FeaturesComponent implements OnInit {
	features:any;
	featureErr:any;
	constructor(public dialog: MdDialog, public featuresService:FeaturesService) { 
		
	}

	ngOnInit() {
		this.getFeatures();
	}

	getFeatures(){
		this.featuresService.getAppFeature()
			.subscribe(features=>{
				this.features = features;
			}, error=>{
				this.featureErr = error;
			})
	}

	deleteFeatures(featureId, index){
		this.featuresService.deleteAppFeture(featureId)
			.subscribe(deleteRes=>{
					this.features.splice(index, 1);
				}, deleteError=>{
					this.featureErr = deleteError;
				});
	}
	
	openFeatureModal(editData:AppFeatures=<AppFeatures>{}){
		let dialogOptions = {
			height: '350px',
  			width: '600px',
  			position: 'center',
  			disableClose: true
		};

		dialogOptions["data"] = {};
		if(JSON.stringify(editData) !== '{}'){
			dialogOptions["data"]["features"] = editData;
		}
		let dialogRef = this.dialog.open(AppFeaturesDialogComponent, dialogOptions);
    	dialogRef.afterClosed().subscribe(result => {
    		if(result !== "Option 1"){
    			this.getFeatures();
    		}
    	});
	}

}

@Component({
	selector: 'app-features-dialog',
	templateUrl: './features-dialog.html',
})
export class AppFeaturesDialogComponent implements OnInit {
	appFeatures: AppFeatures = <AppFeatures>{};
	title: string = 'Add Feature Details';
	constructor(public dialogRef: MdDialogRef<AppFeaturesDialogComponent>, public featuresService: FeaturesService){
		if(this.dialogRef.config.data){
			if(this.dialogRef.config.data.features){
				this.appFeatures = Object.assign({}, this.dialogRef.config.data.features);
				this.title = 'Edit Feature Details';
			}
		}
	}

	ngOnInit(){

	}

	submitAppFeatures(featureForm:any){
		if(featureForm.valid){
			if(this.dialogRef.config.data.features){
				this.updateFeatureDetails();
			}else{
				this.saveFeatureDetails();
			}
		}
	}

	updateFeatureDetails(){
		this.featuresService.updateAppFeature(this.appFeatures)
			.subscribe(feature=>{
				this.dialogRef.close(feature);
			}, error=>{
				this.dialogRef.close(error);
			});
	}

	saveFeatureDetails(){
		this.featuresService.submitAppFeature(this.appFeatures)
			.subscribe(feature=>{
				this.dialogRef.close(feature);
			}, error=>{
				this.dialogRef.close(error);
			});
	}
}