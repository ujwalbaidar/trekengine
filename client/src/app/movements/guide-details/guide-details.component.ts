import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { MovementsService, UserService } from '../../services/index';
import { User } from '../../models/models';
import { DeleteConfimationDialogComponent } from '../../delete-confimation-dialog/delete-confimation-dialog.component';

@Component({
  selector: 'guide-details',
  templateUrl: './guide-details.component.html',
  styleUrls: ['./guide-details.component.css']
})
export class GuideDetailsComponent implements OnInit  {
	public guideUsers:any;
	public approver: string;

	constructor(private _route: Router, public dialog: MdDialog, public movementServie: MovementsService, public userService: UserService, public location: Location){}

	ngOnInit() {
		this.getGuideLists();
	}

	getGuideLists(){
		this.userService.getGuides()
		.subscribe(users=>{
			this.guideUsers = users['guides'];
			this.approver = users['approver'];
		}, userError=>{
			console.log(userError);
		});
	}

	removeGuide(userEmail:string, index:number) {
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
					this.userService.removeUserFromList(userEmail, this.approver)
					.subscribe(users=>{
							this.guideUsers.splice(index, 1);
						}, userError=>{
							console.log(userError);
						});
    			}
			});
	}

	openAddGuideModal(){
		let dialogOptions = {
			// height: '440px',
  			width: '600px',
  			position: 'center',
  			disableClose: true
		};


		let dialogRef = this.dialog.open(GuideDetailsDialogComponent, dialogOptions);
    	dialogRef.afterClosed().subscribe(result => {
    		if(result!=='opt-cancel'){
				this.openAddGuideSuccessModal(result.type)
    		}
    	});
	}

	openAddGuideSuccessModal(notificationType:string){
		let dialogOptions = {
			// height: '200px',
  			width: '400px',
  			position: 'center',
  			disableClose: true
		};
		dialogOptions["data"] = {};
		dialogOptions["data"]["notificationType"] = notificationType;

		let dialogRef = this.dialog.open(GuideDetailsDialogComponent, dialogOptions);
    	dialogRef.afterClosed().subscribe(result => {
			this.getGuideLists();
    	});
	}
}
 
@Component({
	selector: 'guide-details-dialog',
	templateUrl: './guide-details-dialog.html',
})
export class GuideDetailsDialogComponent {
	user: User = <User>{};
	submittedGuideForm: boolean = false;
	disableButton: boolean = false;
	isNotification: boolean = false;
	notificationType: string;

	constructor(public dialogRef: MdDialogRef<GuideDetailsDialogComponent>, public movementServie: MovementsService, public userService: UserService) {
		if(this.dialogRef._containerInstance.dialogConfig.data && this.dialogRef._containerInstance.dialogConfig.data.notificationType){
				this.isNotification = true;
				this.notificationType = this.dialogRef._containerInstance.dialogConfig.data.notificationType;
		}
	}

	submitGuideDetails(guideForm:any){
		this.submittedGuideForm = true;
		if(guideForm.valid){
			this.disableButton = true;
			this.userService.addGuideToAdmin(this.user)
				.subscribe(successResponse=>{
					this.submittedGuideForm = false;
					this.disableButton = false;
					this.dialogRef.close(successResponse);
				}, error=>{
					this.submittedGuideForm = false;
					this.disableButton = false;
					this.dialogRef.close(error);
				});
		}
	}

	saveGuideDetails(){
		this.dialogRef.close(this.user.email);
	}
}
