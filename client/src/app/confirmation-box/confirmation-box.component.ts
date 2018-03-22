import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-confirmation-box',
  templateUrl: './confirmation-box.component.html',
  styleUrls: ['./confirmation-box.component.css']
})
export class ConfirmationBoxComponent implements OnInit {
	confirmationData: any;

	constructor(public dialogRef: MatDialogRef<ConfirmationBoxComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

	ngOnInit() {
		if(this.data){
			this.confirmationData = JSON.parse(JSON.stringify(this.data));
		}
	}

	selectedOption(selected){
		this.dialogRef.close(selected);
	}
}
