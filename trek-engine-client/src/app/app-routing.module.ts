import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PackageBillingsComponent } from './package-billings/package-billings.component';
import { FeaturesComponent } from './features/features.component';
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

const appRoutes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: 'pricings', component: PackageBillingsComponent },
	{ 
		path: '', 
		component: HomeComponent, 
		children:[
			{ path:'', component: DashboardComponent},
			{ path: 'package-billings', component: PackageBillingsComponent },
			{ path: 'app-features', component: FeaturesComponent},
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
			}
		]
	},
	{ path: 'register', component: RegisterComponent }
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