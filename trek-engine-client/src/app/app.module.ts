import { NgModule, enableProdMode }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CookieService } from 'angular2-cookie/services/cookies.service';
import 'hammerjs';
import { MaterialModule, OverlayContainer } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MyDatePickerModule } from 'mydatepicker';
import { AppRoutingModule } from './app-routing.module';
import { 
  AuthService, 
  UserService, 
  MovementsService, 
  PackageBillingsService, 
  FeaturesService ,
  PackagesService,
  AuthResolverService,
  NotificationsService
} from './services/index';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PackageBillingsComponent } from './package-billings/package-billings.component';
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
import { MovementDetailsComponent } from './movements/movement-details/movement-details.component';
import { FeaturesComponent } from './features/features.component';
import { AppFeaturesDialogComponent } from './features/features.component';
import { PackagesComponent } from './packages/packages.component';
import { PackageDetailsComponent } from './packages/package-details/package-details.component';
import { PublicHomeComponent } from './public-home/public-home.component';
import { BillingHistoryComponent, BillingDialogComponent } from './billing-history';
import { AppUsersComponent } from './app-users/app-users.component';
import { ProfileComponent } from './profile/profile.component';
import { EqualValidatorDirective } from './directive/equal-validator.directive';
import { NotificationsComponent } from './notifications/notifications.component';

enableProdMode();

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
    TravellerDetailsComponent, TravellerDetailsDialogComponent, MovementDetailsComponent, 
    FeaturesComponent, AppFeaturesDialogComponent,
    PackageBillingsComponent,
    PackagesComponent,
    PackageDetailsComponent,
    PublicHomeComponent,
    BillingHistoryComponent, BillingDialogComponent,
    AppUsersComponent,
    ProfileComponent,
    EqualValidatorDirective,
    NotificationsComponent
  ],
  imports: [
    BrowserModule,
    MaterialModule,
    BrowserAnimationsModule,
    MyDatePickerModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule
  ],
  providers: [
  	CookieService,
  	AuthService, 
    UserService, 
    MovementsService,
    PackageBillingsService,
    FeaturesService,
    PackagesService,
    AuthResolverService,
    NotificationsService
  ],
  bootstrap: [AppComponent],
  entryComponents: [ 
    TripDetailsDialogComponent, 
    GuideDetailsDialogComponent, 
    BookingsDialogComponent, 
    FlightDetailsDialogComponent,
    TravellerDetailsDialogComponent,
    AppFeaturesDialogComponent,
    BillingDialogComponent
  ]
})
export class AppModule { 
  constructor(overlayContainer: OverlayContainer) {
    overlayContainer.themeClass = 'deeppurple-amber';
  }
}
