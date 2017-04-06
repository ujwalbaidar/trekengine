import { Component, OnInit } from '@angular/core';
import { AppPackage } from '../models/models';
import { PackagesService } from '../services';

@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.css']
})
export class PackagesComponent implements OnInit {
	packages:any;
	packageErr:any;
	constructor(public packagesService:PackagesService) { 
		
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
		this.packagesService.deleteAppPackage(packageId)
			.subscribe(deleteRes=>{
					this.packages.splice(index, 1);
				}, deleteError=>{
					this.packageErr = deleteError;
				});
	}
}