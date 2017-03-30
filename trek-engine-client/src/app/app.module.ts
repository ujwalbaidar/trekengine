import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CookieService } from 'angular2-cookie/services/cookies.service';
import 'hammerjs';
import { MaterialModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MyDatePickerModule } from 'mydatepicker';
import { AppRoutingModule } from './app-routing.module';
import { AuthService, UserService, MovementsService } from './services/index';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { 
  MovementsComponent, 
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
  declarations: [
    AppComponent,
    DashboardComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    MovementsComponent,
    TripDetailsComponent,
    TripDetailsComponent, TripDetailsDialogComponent, 
    GuideDetailsComponent, GuideDetailsDialogComponent,
    BookingsComponent, BookingsDialogComponent, BookingDetailsComponent,
    FlightDetailsComponent, FlightDetailsDialogComponent,
    TravellerDetailsComponent, TravellerDetailsDialogComponent
  ],
  imports: [
    BrowserModule,
    MaterialModule,
    BrowserAnimationsModule,
    MyDatePickerModule,
    AppRoutingModule,
    FormsModule,
    HttpModule
  ],
  providers: [
  	CookieService,
  	AuthService, 
    UserService, 
    MovementsService
  ],
  bootstrap: [AppComponent],
  entryComponents: [ 
    TripDetailsDialogComponent, 
    GuideDetailsDialogComponent, 
    BookingsDialogComponent, 
    FlightDetailsDialogComponent,
    TravellerDetailsDialogComponent
  ]
})
export class AppModule { }