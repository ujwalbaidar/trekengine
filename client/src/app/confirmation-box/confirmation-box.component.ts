import { Component, OnInit } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';

@Component({
  selector: 'app-confirmation-box',
  templateUrl: './confirmation-box.component.html',
  styleUrls: ['./confirmation-box.component.css']
})
export class ConfirmationBoxComponent implements OnInit {
	confirmationData: any;

	constructor(public dialogRef: MdDialogRef<ConfirmationBoxComponent>) { }

	ngOnInit() {
		if(this.dialogRef._containerInstance.dialogConfig.data){
			this.confirmationData = JSON.parse(JSON.stringify(this.dialogRef._containerInstance.dialogConfig.data));
		}
	}

	selectedOption(selected){
		this.dialogRef.close(selected);
	}
}
