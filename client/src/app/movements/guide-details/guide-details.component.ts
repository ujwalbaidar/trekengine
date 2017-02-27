import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { MovementsService, UserService } from '../../services/index';
import { User } from '../../register/register.model';
@Component({
    selector: 'guide-details',
    templateUrl: './src/app/movements/guide-details/guide-details.component.html'
})
export class GuideDetailsComponent implements OnInit  {
	constructor(private _route: Router, public dialog: MdDialog, public movementServie: MovementsService, public location: Location){}

	ngOnInit() {
		this.getGuides();
	}

	getGuides(){

	}
	openAddGuideModal(){
		let dialogOptions = {
			height: '600px',
  			width: '600px',
  			position: 'center',
  			disableClose: true
		};

		// if(JSON.stringify(editData) !== '{}'){
		// 	dialogOptions["data"] = editData;
		// };

		let dialogRef = this.dialog.open(GuideDetailsDialogComponent, dialogOptions);
    	dialogRef.afterClosed().subscribe(result => {
    		console.log(result)
      		// this.selectedOption = result;
      		// this.getTrips();
    	});
	}
}

@Component({
	selector: 'guide-details-dialog',
	templateUrl: './src/app/movements/guide-details/guide-details-dialog.html',
})
export class GuideDetailsDialogComponent {
	user: User = <User>{};
	constructor(public dialogRef: MdDialogRef<GuideDetailsDialogComponent>, public movementServie: MovementsService, public userService: UserService) {}

	submitGuideDetails(guideForm:any){
		if(guideForm.valid){
			this.saveGuideDetails();
		}
	}

	saveGuideDetails(){
		this.user.role = 30;
		const saveRequest = this.userService.registerUser(this.user)
			.subscribe(guidesDetail=>{
					this.dialogRef.close(guidesDetail);
				}, error=>{
					this.dialogRef.close(error);
				}, () => { console.log('Completed'); });
				setTimeout(() => {
					saveRequest.unsubscribe();
				},30);
	}
}
