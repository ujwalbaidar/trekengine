import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { CookieService } from 'angular2-cookie/core';

@Injectable()
export class AuthResolverService implements Resolve<any> {
	constructor(private auth: AuthService, private router: Router, public _cookies: CookieService) { 

	}
	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
	}
}
