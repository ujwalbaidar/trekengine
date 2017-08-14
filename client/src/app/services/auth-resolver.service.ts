import { Injectable } from '@angular/core';
import { 
	Router, 
	Resolve, 
	RouterStateSnapshot, 
	ActivatedRouteSnapshot,
	CanActivate, 
	CanActivateChild
} from '@angular/router';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthResolverService implements CanActivate, CanActivateChild {
	public allowRedirect;

	constructor(private auth: AuthService, private router: Router, public _cookies: CookieService) { 
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
	    let url: string = state.url;
	    return this.checkLogin(url);
	}

	canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
	    let url: string = state.url;
	    return this.checkLogin(url);
	}

	checkLogin(url: string) {
		let cookieObj = this._cookies.getAll();
		if(cookieObj['authToken']){
			return this.auth.validateAuthToken(cookieObj['authToken'])
				.then(allowRedirect=>{
					return allowRedirect;
				});
		}else{
			this._cookies.removeAll();
			this.router.navigate(['/home']);
			return false;
		}
	}
} 