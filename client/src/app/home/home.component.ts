import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/index';
import { Router } from '@angular/router';

@Component({
    selector: '',
    templateUrl: './src/app/home/home.component.html',
    styleUrls: ['./src/app/home/home.component.css'],
})
export class HomeComponent implements OnInit {
	constructor(private authService: AuthService, private _route: Router){}
	ngOnInit(){}
	logout() {
		this.authService.logout();
	}
}