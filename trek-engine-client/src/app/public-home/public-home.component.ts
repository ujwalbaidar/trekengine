import { Component, OnInit } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-public-home',
  templateUrl: './public-home.component.html',
  styleUrls: ['./public-home.component.css']
})
export class PublicHomeComponent implements OnInit {

	constructor(public dialog: MdDialog, private _route: Router) { }

	ngOnInit() {
		
	}

	openLoginModal(){
		let dialogOptions = {
			height: '460px',
  			width: '600px',
  			position: 'center',
  			disableClose: true
		};

		let dialogRef = this.dialog.open(LoginComponent, dialogOptions);
		dialogRef.afterClosed().subscribe(result => {
			if(result && result!=='opt-cancel'){
				this._route.navigate(['/app']);
			}
    	});
	}
}
