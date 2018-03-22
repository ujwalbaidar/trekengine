import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
	selector: 'app-delete-confimation-dialog',
	templateUrl: './delete-confimation-dialog.component.html',
	styleUrls: ['./delete-confimation-dialog.component.css']
})
export class DeleteConfimationDialogComponent {
	constructor(public dialogRef: MatDialogRef<DeleteConfimationDialogComponent>) {}
	selectedOption(selected){
		this.dialogRef.close(selected);
	}
}
