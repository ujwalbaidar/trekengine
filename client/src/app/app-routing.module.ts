import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MovementComponent, TripDetailsComponent } from './movements/index';

const appRoutes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ 
		path: '', 
		component: HomeComponent, 
		children:[
			{ path:'', component: DashboardComponent},
			{ 
				path: 'movements', 
				component: MovementComponent, 
				children:[
					// { path: 'bookings' },
					{ path: 'trip-details', component: TripDetailsComponent}
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