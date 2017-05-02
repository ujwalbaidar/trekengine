import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ActivateTokenComponent } from './register/activate-token/activate-token.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PackageBillingsComponent } from './package-billings/package-billings.component';
import { FeaturesComponent } from './features/features.component';
import { PackagesComponent } from './packages/packages.component';
import { PackageDetailsComponent } from './packages/package-details/package-details.component';
import { PublicHomeComponent } from './public-home/public-home.component';
import { BillingHistoryComponent } from './billing-history/billing-history.component';
import { AppUsersComponent } from './app-users/app-users.component';
import { ProfileComponent } from './profile/profile.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { 
	MovementsComponent, 
	TripDetailsComponent, 
	GuideDetailsComponent, 
	BookingsComponent, 
	BookingDetailsComponent,
	FlightDetailsComponent,
	TravellerDetailsComponent,
	MovementDetailsComponent 
} from './movements/index';

import { AuthResolverService } from './services';

const appRoutes: Routes = [
	{ 
		path: '', 
		component: PublicHomeComponent, 
		children:[
			{ path: 'login', component: LoginComponent },
			{ path: 'home', component: PackageBillingsComponent },
			{ path: 'register/service/:serviceType', component: RegisterComponent },
			{ path: 'authorization/token/:token/validate-user', component: ActivateTokenComponent }
		] 
	},
	{ 
		path: 'app', 
		component: HomeComponent, 
		children:[
			{ path: '', component: DashboardComponent},
			{ 
				path: 'app-users', 
				component: AppUsersComponent, 
				resolve: {
              		crisis: AuthResolverService
            	}
        	},
        	{ path: 'app-users/:userId/billing-history', component: BillingHistoryComponent },
			{ path: 'package-billings', component: PackageBillingsComponent },
			{ path: 'billing-history', component: BillingHistoryComponent },
			{ path: 'app-features', component: FeaturesComponent },
			{ path: 'app-packages', component: PackagesComponent },
			{ path: 'app-packages/details', component: PackageDetailsComponent },
			{ path: 'app-packages/details/edit/:packageId', component: PackageDetailsComponent },
			{ 
				path: 'movements', 
				component: MovementsComponent, 
				children:[
					{ path: '', component: MovementDetailsComponent },
					{ path: 'bookings', component: BookingsComponent },
					{ path: 'bookings/booking-details/:bookingId', component: BookingDetailsComponent },
					{ path: 'trip-details', component: TripDetailsComponent },
					{ path: 'guide-details', component: GuideDetailsComponent },
					{ path: 'traveller-details', component: TravellerDetailsComponent },
					{ path: 'flight-details', component: FlightDetailsComponent }
				]
			},
			{ path: 'notifications', component: NotificationsComponent },
			{ path: 'profile', component: ProfileComponent }
		]
	},
	{ path: '**', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
	imports: [
    	RouterModule.forRoot(appRoutes)
  	],
  	exports: [
    	RouterModule
  	]
})
export class AppRoutingModule {}