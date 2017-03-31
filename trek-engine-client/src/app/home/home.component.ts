import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/index';
import { Router } from '@angular/router';

@Component({
  selector: '',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
	constructor(private authService: AuthService, private _route: Router){}
	ngOnInit(){}
	logout() {
		this.authService.logout();
	}
}
