import { Component, OnInit } from '@angular/core';
import { UserService } from '../services';

@Component({
  selector: 'app-users',
  templateUrl: './app-users.component.html',
  styleUrls: ['./app-users.component.css']
})
export class AppUsersComponent implements OnInit {
	adminUsers:any;
	userErr:any;

	constructor(private userService:UserService) { }

  	ngOnInit() {
  		this.userService.findByQuery([{role:20},{status:true}])
  			.subscribe(users=>{
  				this.adminUsers = users;
  			}, error=>{
  				this.userErr = error;
  			});
  	}

}
