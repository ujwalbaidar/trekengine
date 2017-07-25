import { Injectable } from '@angular/core';
import { 
	Router, 
	ActivatedRoute,
	Resolve, 
	RouterStateSnapshot, 
	ActivatedRouteSnapshot,
	CanActivate
} from '@angular/router';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class RoleResolverService implements CanActivate {
	constructor(private auth: AuthService, private router: Router, public _cookies: CookieService, private route: ActivatedRoute) { 

	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
	    let url: string = state.url;
	    return this.validateRole(url);
	}

	validateRole(url:string) {
		let cookieObj = this._cookies.getAll();
		return this.checkRole(cookieObj['authToken'], url)
			.then(allowRedirect=>{
				return allowRedirect;
			});
	}

	getUrlByRole(role:string, url: string){
		let urlObj = {
			10: [ 
				'/app', 
				'/app/app-users', 
				'/app/app-features', 
				'/app/app-packages', 
				'/app/profile', 
				'/app/notifications', 
				'/app/package-billings', 
				'/app/app-packages/details' 
			],
			20: [ 
				'/app',
				'/app/bookings',
				'/app/movements',
				'/app/movements/guide-details',
				'/app/movements/trip-details',
				'/app/movements/traveller-details',
				'/app/movements/traveler-info',
				'/app/movements/flight-details',
				'/app/movements/airport-pickup-details',
				'/app/profile',
				'/app/notifications',
				'/app/package-billings',
				'/app/billing-history',
				'/app/analytics/audience/overview',
				'/app/analytics/audience/age',
				'/app/analytics/audience/gender',
				'/app/analytics/audience/country',
				'/app/analytics/trip/overview',
				'/app/analytics/trip/trip-booking'
			],
			30: [ 
				'/app', 
				'/app/movements', 
				'/app/profile', 
				'/app/notifications'
			],
		}
		return urlObj[role];
	}

	checkRole(token:string, url:string){
		return new Promise(resolve=>{
			if(this.auth.returnDecodedData() === undefined || JSON.stringify(this.auth.returnDecodedData()) === "{}"){
				this.auth.validateToken(token)
					.subscribe(resolvedData=>{
						if(resolvedData && JSON.stringify(resolvedData) !== "{}"){
							let urlObj = this.getUrlByRole(JSON.stringify(resolvedData['role']), url);
							if(urlObj.includes(url)){
								resolve(true);
							}else{
								if(resolvedData['role'] === 10 && (url.startsWith('/app/app-users/') || url.startsWith('/app/app-packages/details/edit/'))){
									resolve(true);
								}else if((resolvedData['role'] === 20 || resolvedData['role'] === 30) && (url.startsWith('/app/bookings/booking-details/'))){
									resolve(true);
								}else{
									this.router.navigate(['/app/profile']);
									resolve(false);
								}
							}
						}else{
							this._cookies.removeAll();
							this.router.navigate(['/home']);
							resolve(false);
						}
					}, error=>{
						this._cookies.removeAll();
						this.router.navigate(['/home']);
						resolve(false);
					});
			}else{
				let decodedData = this.auth.returnDecodedData();
				let decodedRole = decodedData['role'];
				let urlObj = this.getUrlByRole(JSON.stringify(decodedRole), url);

				if(urlObj.includes(url)){
					resolve(true);
				}else{
					if(decodedRole === 10 && (url.startsWith('/app/app-users') || url.startsWith('/app/app-packages/details/edit/'))){
						resolve(true);
					}else if((decodedRole === 20 || decodedRole === 30) && (url.startsWith('/app/bookings/booking-details/'))){
						resolve(true);
					}else if((decodedRole === 20) && ( url.startsWith('/app/bookings/booking-details/') || url.startsWith('/app/analytics/audience/age-details/') || url.startsWith('/app/analytics/audience/country-details/countryName/') || url.startsWith('/app/analytics/trip/trip-booking/details/') )){
						resolve(true);
					}else{
						this.router.navigate(['/home']);
						resolve(false);
					}
				}
			}
		});
	}
}
