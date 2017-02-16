import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/index';
import { Router } from '@angular/router';

@Component({
    selector: 'dashboard',
    templateUrl: './src/app/dashboard/dashboard.component.html',
    styleUrls: ['./src/app/dashboard/dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
	constructor(private authService: AuthService, private _route: Router){}
	ngOnInit(){}
	logout() {
		this.authService.clearCookies();
		this._route.navigate(['/login']);

	}
}