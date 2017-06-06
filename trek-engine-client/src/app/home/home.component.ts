import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/index';
import { Router } from '@angular/router';
import { CookieService } from 'angular2-cookie/core';
declare var jQuery:any;
import { environment } from '../../environments/environment';

@Component({
  selector: '',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
	cookieData:any;

	constructor(public _cookieService:CookieService, public authService: AuthService, private _route: Router){
	}
	ngOnInit(){
		this.cookieData = this._cookieService.getAll();
		jQuery(".dropdown-button").dropdown();
		jQuery(".button-collapse").sideNav({
			closeOnClick: true
		});
	}
	logout() {
		this._cookieService.removeAll();
		window.location.href = environment.webUrl+'/home';
	}

	dropDownNav(){
		jQuery(".dropdown-button").dropdown();
	}

	openSideNav(){
		jQuery(".button-collapse").sideNav({
			closeOnClick: true
		});
	}
}
