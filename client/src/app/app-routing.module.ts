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
import { AppUsersDetailsComponent } from './app-users-details/app-users-details.component';
import { ProfileComponent } from './profile/profile.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ValidateRegisterComponent } from './register/validate-register/validate-register.component';
import { 
	MovementsComponent, 
	TripDetailsComponent, 
	GuideDetailsComponent, 
	BookingsComponent, 
	BookingDetailsComponent,
	FlightDetailsComponent,
	TravellerDetailsComponent,
	MovementDetailsComponent,
	AirportPickupDetailsComponent,
	TravelerInfoComponent
} from './movements/index';

import { AudienceOverviewComponent } from './analytics/audience/audience-overview/audience-overview.component';
import { AudienceAgeComponent } from './analytics/audience/audience-age/audience-age.component';
import { AudienceAgeDetailsComponent } from './analytics/audience/audience-age-details/audience-age-details.component';
import { AudienceCountryComponent } from './analytics/audience/audience-country/audience-country.component';
import { AudienceCountryDetailsComponent } from './analytics/audience/audience-country-details/audience-country-details.component';
import { AudienceGenderComponent } from './analytics/audience/audience-gender/audience-gender.component';
import { TripOverviewComponent } from './analytics/trip-analytics/trip-overview/trip-overview.component';
import { TripBookingComponent } from './analytics/trip-analytics/trip-booking/trip-booking.component';
import { TripBookingDetailsComponent } from './analytics/trip-analytics/trip-booking-details/trip-booking-details.component';

import { AuthResolverService, RoleResolverService } from './services';
import { BillingCheckoutComponent } from './billing-checkout/billing-checkout.component';

const appRoutes: Routes = [
	{ 
		path: '', 
		component: PublicHomeComponent, 
		children:[
			{ path: 'login', component: LoginComponent },
			{ path: 'home', component: PackageBillingsComponent },
			{ path: 'register', component: RegisterComponent },
			{ path: 'register/service/:serviceType', component: RegisterComponent },
			{ path: 'register/validate/:code/:loginType/:authuser/:prompt/:session_state', component: ValidateRegisterComponent },
			{ path: 'register/validate/:loginType/:code', component: ValidateRegisterComponent },
			{ path: 'authorization/token/:token/validate-user', component: ActivateTokenComponent },
			{ path: 'change-password/token/:token/reset', component: ChangePasswordComponent },
			{ path: 'forgot-password', component: ForgotPasswordComponent }
		] 
	},
	{ 
		path: 'app', 
		component: HomeComponent, 
		canActivate: [AuthResolverService],
		canActivateChild: [AuthResolverService],
		children:[
			{ 
				path: '', 
				component: DashboardComponent
			},
			{ 
				path: 'app-users', 
				component: AppUsersComponent,
				canActivate: [RoleResolverService]
        	},
        	{ 
				path: 'app-users/:userId/details', 
				component: AppUsersDetailsComponent,
				canActivate: [RoleResolverService]
        	},
        	// { path: 'app-users/:userId/billing-history', component: BillingHistoryComponent, canActivate: [RoleResolverService] },
			{ path: 'package-billings', component: PackageBillingsComponent, canActivate: [RoleResolverService] },
			{ path: 'billing-history', component: BillingHistoryComponent, canActivate: [RoleResolverService] },
			{ path: 'app-features', component: FeaturesComponent, canActivate: [RoleResolverService] },
			{ path: 'app-packages', component: PackagesComponent, canActivate: [RoleResolverService] },
			{ path: 'app-packages/details', component: PackageDetailsComponent, canActivate: [RoleResolverService] },
			{ path: 'app-packages/details/edit/:packageId', component: PackageDetailsComponent, canActivate: [RoleResolverService] },
			{ 
				path: 'movements', 
				component: MovementsComponent, 
				canActivate: [RoleResolverService], 
				children:[
					{ path: '', component: MovementDetailsComponent, canActivate: [RoleResolverService] },
					{ path: 'trip-details', component: TripDetailsComponent, canActivate: [RoleResolverService] },
					{ path: 'guide-details', component: GuideDetailsComponent, canActivate: [RoleResolverService] },
					{ path: 'traveller-details', component: TravellerDetailsComponent, canActivate: [RoleResolverService] },
					{ path: 'flight-details', component: FlightDetailsComponent, canActivate: [RoleResolverService] },
					{ path: 'airport-pickup-details', component: AirportPickupDetailsComponent, canActivate: [RoleResolverService] },
					{ path: 'traveler-info', component: TravelerInfoComponent, canActivate: [RoleResolverService] },
					{ path: 'traveler-info/booking/:bookingId', component: TravelerInfoComponent },
					{ path: 'traveler-info/booking/:bookingId/traveler/:travelerId/redirect/:redirectPath', component: TravelerInfoComponent },
					{ path: 'traveler-info/booking/traveler/:travelerId/redirect/:redirectPath', component: TravelerInfoComponent },
				]
			},
			{ 
				path: 'bookings', 
				component: BookingsComponent, 
				canActivate: [RoleResolverService]
            },
			{ path: 'bookings/booking-details/:bookingId', component: BookingDetailsComponent, canActivate: [RoleResolverService] },
			{ path: 'notifications', component: NotificationsComponent },
			{ path: 'profile', component: ProfileComponent },
			{ path: 'analytics/audience/overview', component: AudienceOverviewComponent, canActivate: [RoleResolverService] },
			{ path: 'analytics/audience/age', component: AudienceAgeComponent, canActivate: [RoleResolverService] },
			{ path: 'analytics/audience/gender', component: AudienceGenderComponent, canActivate: [RoleResolverService] },
			{ path: 'analytics/audience/country', component: AudienceCountryComponent, canActivate: [RoleResolverService] },
			{ path: 'analytics/audience/age-details/minAge/:minAge/maxAge/:maxAge', component: AudienceAgeDetailsComponent, canActivate: [RoleResolverService] },
			{ path: 'analytics/audience/country-details/countryName/:countryName', component: AudienceCountryDetailsComponent, canActivate: [RoleResolverService] },

			{ path: 'analytics/trip/overview', component: TripOverviewComponent, canActivate: [RoleResolverService] },
			{ path: 'analytics/trip/trip-booking', component: TripBookingComponent, canActivate: [RoleResolverService] },
			{ path: 'analytics/trip/trip-booking/details/:tripId', component: TripBookingDetailsComponent, canActivate: [RoleResolverService] },
			{ path: 'checkout', component: BillingCheckoutComponent, canActivate: [RoleResolverService]  },
			{ path: 'checkout/success/:success', component: BillingCheckoutComponent, canActivate: [RoleResolverService] },
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