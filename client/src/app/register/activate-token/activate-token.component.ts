import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services';

@Component({
  selector: 'app-activate-token',
  templateUrl: './activate-token.component.html',
  styleUrls: ['./activate-token.component.css']
})
export class ActivateTokenComponent implements OnInit {
	tokenExpErr:boolean = false;
	alreadyActive:boolean = false;
	activated:boolean = false;
	activateErr = false;

	constructor(private route: ActivatedRoute, public userService: UserService, private _route:Router) { }

	ngOnInit() {
		this.route.params.subscribe(params => {
			if(params.token !== undefined){
				this.authorizeRegistrationToken(params.token);
			}
	    });
	}

	authorizeRegistrationToken(token:string){
		this.userService.authorizeRegistrationToken(token)
			.subscribe(responseData=>{
				let tokenResponse = JSON.parse(JSON.stringify(responseData));
				if(tokenResponse == 'expire-err'){
					this.tokenExpErr = true;
				}else if(tokenResponse == 'already-active'){
					this.alreadyActive = true;
				}else{
					this.activated = true;
				}
			},err=>{
				this.activateErr = true;
				this._route.navigate(['/activate-account']);
			});
	}
}
