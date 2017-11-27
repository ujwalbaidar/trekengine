import { Component, OnInit } from '@angular/core';
import { UserService } from '../services';
import { MdSnackBar } from '@angular/material';
import { MdDialog, MdDialogRef } from '@angular/material';
import { DeleteConfimationDialogComponent } from '../delete-confimation-dialog/delete-confimation-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './app-users.component.html',
  styleUrls: ['./app-users.component.css']
})
export class AppUsersComponent implements OnInit {
    adminUsers:any;
	userErr:any;

	constructor(private userService:UserService, public snackBar: MdSnackBar, public dialog: MdDialog) { }

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

    deleteUserInfo(userId){
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
                this.userService.deleteUserInfo(userId)
                .subscribe(deleteResp=>{
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
        });
    }

}
