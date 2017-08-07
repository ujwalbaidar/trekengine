import { Component, OnInit } from '@angular/core';
import { UserService } from '../services';
import { MdSnackBar } from '@angular/material';

@Component({
  selector: 'app-users',
  templateUrl: './app-users.component.html',
  styleUrls: ['./app-users.component.css']
})
export class AppUsersComponent implements OnInit {
	adminUsers:any;
	userErr:any;

	constructor(private userService:UserService, public snackBar: MdSnackBar) { }

  	ngOnInit() {
  		this.queryUser();
  	}

    queryUser(){
      this.userService.findByQuery([{role:20}])
        .subscribe(users=>{
          this.adminUsers = users;
        }, error=>{
          this.userErr = error;
        });
    }

    toggleStatus(index){
      let adminUserOb = JSON.parse(JSON.stringify(this.adminUsers[index]));
      if(adminUserOb['status'] == true){
        adminUserOb['status'] = false;
      }else{
        adminUserOb['status'] = true;
      }
      this.userService.updateUserInfo(adminUserOb)
      .subscribe(updateData=>{
        this.queryUser();
      }, error=>{
        this.snackBar.open('Error has been occured for the action.', '', {
            duration: 3000,
          });
          setTimeout(()=>{ 
            location.reload();
          }, 3000);
      });
    }

}
