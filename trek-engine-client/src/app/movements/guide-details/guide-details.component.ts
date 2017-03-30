import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { MovementsService, UserService } from '../../services/index';
import { User } from '../../models/models';
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
		this.userService.removeUserFromList(userEmail, this.approver)
		.subscribe(users=>{
				this.guideUsers.splice(index, 1);
			}, userError=>{
				console.log(userError);
			});
	}

	openAddGuideModal(){
		let dialogOptions = {
			height: '300px',
  			width: '600px',
  			position: 'center',
  			disableClose: true
		};


		let dialogRef = this.dialog.open(GuideDetailsDialogComponent, dialogOptions);
    	dialogRef.afterClosed().subscribe(result => {
    		console.log("http://localhost:5000/login?email="+result+"&&from="+this.approver);
    	});
	}
}

@Component({
	selector: 'guide-details-dialog',
	templateUrl: './guide-details-dialog.html',
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
		this.dialogRef.close(this.user.email);
	}
}
