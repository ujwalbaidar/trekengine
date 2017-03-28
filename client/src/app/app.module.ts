import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CookieService } from 'angular2-cookie/services/cookies.service';
// import 'hammerjs';
import { MaterialModule } from '@angular/material';
import { FormsModule }   from '@angular/forms';
import { MyDatePickerModule } from 'mydatepicker';

import { AppRoutingModule } from './app-routing.module';
import { AuthService, UserService, MovementsService } from './services/index';

import { AppComponent }  from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { 
  MovementComponent, 
  TripDetailsComponent, 
  TripDetailsDialogComponent, 
  GuideDetailsComponent,
  GuideDetailsDialogComponent,
  BookingsComponent,
  BookingsDialogComponent,
  BookingDetailsComponent,
  FlightDetailsComponent, 
  FlightDetailsDialogComponent,
  TravellerDetailsComponent,
  TravellerDetailsDialogComponent
} from './movements/index';

@NgModule({
	imports: [ 
		BrowserModule, 
		MaterialModule, 
    MyDatePickerModule,
		AppRoutingModule,
		FormsModule 
	],
	declarations: [ 
  	AppComponent, 
  	LoginComponent,
    HomeComponent, 
  	DashboardComponent,
    MovementComponent, 
    TripDetailsComponent, TripDetailsDialogComponent, 
    GuideDetailsComponent, GuideDetailsDialogComponent,
    BookingsComponent, BookingsDialogComponent, BookingDetailsComponent,
    FlightDetailsComponent, FlightDetailsDialogComponent,
    TravellerDetailsComponent, TravellerDetailsDialogComponent,
  	RegisterComponent 
	],
	providers: [ 
		CookieService,
		AuthService, 
    UserService, 
    MovementsService
	],
	bootstrap: [ AppComponent ],
  entryComponents: [ 
    TripDetailsDialogComponent, 
    GuideDetailsDialogComponent, 
    BookingsDialogComponent, 
    FlightDetailsDialogComponent,
    TravellerDetailsDialogComponent
  ]
})

export class AppModule { }