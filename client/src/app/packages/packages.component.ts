import { Component, OnInit } from '@angular/core';
import { AppPackage } from '../models/models';
import { PackagesService } from '../services';
import { MdDialog, MdDialogRef } from '@angular/material';
import { DeleteConfimationDialogComponent } from '../delete-confimation-dialog/delete-confimation-dialog.component';
import { MdSnackBar } from '@angular/material';

@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.css']
})
export class PackagesComponent implements OnInit {
	packages:any;
	packageErr:any;
	constructor(public packagesService:PackagesService, public dialog: MdDialog, public snackBar: MdSnackBar) { 
		
	}

	ngOnInit() {
		this.getPackages();
	}

	getPackages(){
		this.packagesService.getAppPackage()
			.subscribe(packages=>{
				this.packages = packages;
			}, error=>{
				this.packageErr = error;
			})
	}

	deletePackages(packageId, index){
		let dialogOptions = {
  			width: '600px',
  			position: 'center',
  			disableClose: true
		};

		dialogOptions["data"] = {};
		
		let dialogRef = this.dialog.open(DeleteConfimationDialogComponent, dialogOptions);
    	dialogRef.afterClosed().subscribe(result => {
    		let selectedOption = parseInt(result);
    		if(selectedOption == 1){
    			this.packagesService.deleteAppPackage(packageId)
					.subscribe(deleteRes=>{
							this.packages.splice(index, 1);
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

	toggleStatus(index){
		let packageObj = JSON.parse(JSON.stringify(this.packages[index]));
		if(packageObj['status'] == true){
			packageObj['status'] = false;
		}else{
			packageObj['status'] = true;
		}

		this.packagesService.updateAppPackage(packageObj)
			.subscribe(appPackage=>{
				this.getPackages();
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