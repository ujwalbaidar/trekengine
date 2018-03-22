import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AppFeatures } from '../models/models';
import { FeaturesService } from '../services';
import { DeleteConfimationDialogComponent } from '../delete-confimation-dialog/delete-confimation-dialog.component';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css']
})
export class FeaturesComponent implements OnInit {
	features:any;
	featureErr:any;
	constructor(public dialog: MatDialog, public featuresService:FeaturesService, public snackBar: MatSnackBar) { 
		
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
		let dialogOptions = {
  			width: '600px',
  			disableClose: true
		};

		dialogOptions["data"] = {};
		
		let dialogRef = this.dialog.open(DeleteConfimationDialogComponent, dialogOptions);
    	dialogRef.afterClosed().subscribe(result => {
    		let selectedOption = parseInt(result);
    		if(selectedOption == 1){
    			this.featuresService.deleteAppFeture(featureId)
				.subscribe(deleteRes=>{
						this.features.splice(index, 1);
					}, deleteError=>{
						this.snackBar.open('Error has been occured for the action.', '', {
							duration: 3000,
						});
						setTimeout(()=>{ 
							location.reload();
						}, 3000);
					});
    		}
    	});
	}
	
	openFeatureModal(editData:AppFeatures=<AppFeatures>{}){
		let dialogOptions = {
  			width: '600px',
  			disableClose: true
		};

		dialogOptions["data"] = {};
		if(JSON.stringify(editData) !== '{}'){
			dialogOptions["data"]["features"] = editData;
		}
		let dialogRef = this.dialog.open(AppFeaturesDialogComponent, dialogOptions);
    	dialogRef.afterClosed().subscribe(result => {
    		if(result !== "Option 1"){
    			if(result.success == false){
    				this.snackBar.open('Error has been occured for the action.', '', {
						duration: 3000,
					});
					setTimeout(()=>{ 
						location.reload();
					}, 3000);
    			}else{
    				this.getFeatures();
    			}
    		}
    	});
	}

	toggleStatus(index){
		let featureObj = JSON.parse(JSON.stringify(this.features[index]));
		if(featureObj['status'] == true){
			featureObj['status'] = false;
		}else{
			featureObj['status'] = true;
		}

		this.featuresService.updateAppFeature(featureObj)
			.subscribe(feature=>{
				this.getFeatures();
			}, error=>{
				this.snackBar.open('Failed to Change Status.', '', {
					duration: 3000,
				});
				setTimeout(()=>{ 
					location.reload();
				}, 3000);
			});
	}

}

@Component({
	selector: 'app-features-dialog',
	templateUrl: './features-dialog.html',
})
export class AppFeaturesDialogComponent {
	appFeatures: AppFeatures = <AppFeatures>{};
	title: string = 'Add Feature Details';
	submittedFeatureForm: boolean = false;
	featureFormOnProcess: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<AppFeaturesDialogComponent>, 
		@Inject(MAT_DIALOG_DATA) public data: any,
		public featuresService: FeaturesService
	){
		if(data){
			if(data.features){
				this.appFeatures = Object.assign({}, data.features);
				this.title = 'Edit Feature Details';
			}
		}
	}

	submitAppFeatures(featureForm:any){
		this.submittedFeatureForm = true;
		if(featureForm.valid){
			this.featureFormOnProcess = true;
			if(this.data.features){
				this.updateFeatureDetails();
			}else{
				this.saveFeatureDetails();
			}
		}
	}

	updateFeatureDetails(){
		this.featuresService.updateAppFeature(this.appFeatures)
			.subscribe(feature=>{
				feature.success = true;
				this.dialogRef.close(feature);
			}, error=>{
				error.success = false;
				this.dialogRef.close(error);
			});
	}

	saveFeatureDetails(){
		this.featuresService.submitAppFeature(this.appFeatures)
			.subscribe(feature=>{
				feature.success = true;
				this.dialogRef.close(feature);
			}, error=>{
				error.success = false;
				this.dialogRef.close(error);
			});
	}
}