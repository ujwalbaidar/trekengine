import { NgModule, enableProdMode }      from '@angular/core';
import { CommonModule } from "@angular/common";
import { SumTotalPipe } from "./pipes/sumTotal.pipe";

import { BrowserModule } from '@angular/platform-browser';
import { CookieModule } from 'ngx-cookie';
import 'hammerjs';
import { MatSnackBarModule } from '@angular/material';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { OverlayContainer } from '@angular/cdk/overlay';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MyDatePickerModule } from 'mydatepicker';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { AppRoutingModule } from './app-routing.module';
import { 
  AuthService, 
  UserService, 
  MovementsService, 
  PackageBillingsService, 
  FeaturesService ,
  PackagesService,
  AuthResolverService,
  RoleResolverService,
  NotificationsService,
  AnalyticsService,
  BillingCheckoutService,
  ExportReportService,
  FeedbackMsgService
} from './services/index';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent, RegisterSuccessDialogComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PackageBillingsComponent } from './package-billings/package-billings.component';
import { 
  MovementsComponent, 
  TripDetailsComponent, 
  TripDetailsDialogComponent, 
  TripDatesDialogComponent,
  GuideDetailsComponent,
  GuideDetailsDialogComponent,
  BookingsComponent,
  BookingsDialogComponent,
  BookingDetailsComponent,
  FlightDetailsComponent, 
  FlightDetailsDialogComponent,
  TravellerDetailsComponent,
  TravellerDetailsDialogComponent,
  AirportPickupDetailsComponent,
  TravelerInfoComponent
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
import { ActivateTokenComponent } from './register/activate-token/activate-token.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ValidateRegisterComponent } from './register/validate-register/validate-register.component';

import { DeleteConfimationDialogComponent } from './delete-confimation-dialog/delete-confimation-dialog.component';
import { ConfirmationBoxComponent } from './confirmation-box/confirmation-box.component';
import { AudienceOverviewComponent } from './analytics/audience/audience-overview/audience-overview.component';
import { AudienceAgeComponent } from './analytics/audience/audience-age/audience-age.component';
import { AudienceCountryComponent } from './analytics/audience/audience-country/audience-country.component';
import { AudienceGenderComponent } from './analytics/audience/audience-gender/audience-gender.component';
import { TripOverviewComponent } from './analytics/trip-analytics/trip-overview/trip-overview.component';
import { TripBookingComponent } from './analytics/trip-analytics/trip-booking/trip-booking.component';
import { TripBookingDetailsComponent } from './analytics/trip-analytics/trip-booking-details/trip-booking-details.component';
import { GoogleChartComponent } from './google-chart/google-chart.component';
import { AudienceAgeDetailsComponent } from './analytics/audience/audience-age-details/audience-age-details.component';
import { AudienceCountryDetailsComponent } from './analytics/audience/audience-country-details/audience-country-details.component';
import { MaxAgeGroupPipe } from './pipes/max-age-group.pipe';
import { BillingCheckoutComponent } from './billing-checkout/billing-checkout.component';
import { AppUsersDetailsComponent, AdminBillingDialogComponent } from './app-users-details/app-users-details.component';
import { FeedbackmsgComponent } from './feedbackmsg/feedbackmsg.component';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';

enableProdMode();

@NgModule({
  declarations: [
    SumTotalPipe,
    AppComponent,
    DashboardComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    MovementsComponent,
    TripDetailsComponent,
    TripDetailsComponent, TripDetailsDialogComponent, TripDatesDialogComponent,
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
    NotificationsComponent,
    RegisterSuccessDialogComponent,
    ActivateTokenComponent,
    ForgotPasswordComponent,
    ChangePasswordComponent,
    AirportPickupDetailsComponent,
    ValidateRegisterComponent,
    TravelerInfoComponent,
    DeleteConfimationDialogComponent,
    ConfirmationBoxComponent,
    AudienceOverviewComponent,
    AudienceAgeComponent,
    AudienceCountryComponent,
    AudienceGenderComponent,
    TripOverviewComponent,
    TripBookingComponent,
    TripBookingDetailsComponent,
    GoogleChartComponent,
    AudienceAgeDetailsComponent,
    AudienceCountryDetailsComponent,
    MaxAgeGroupPipe,
    BillingCheckoutComponent,
    AppUsersDetailsComponent, AdminBillingDialogComponent, FeedbackmsgComponent
  ],
  imports: [
    BrowserModule,
    MatSnackBarModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatMenuModule,
    MatIconModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatDialogModule,
    BrowserAnimationsModule,
    MyDatePickerModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    CookieModule.forRoot(),
    CommonModule,
    ChartsModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot()
  ],
  providers: [
    AuthService, 
    UserService, 
    MovementsService,
    PackageBillingsService,
    FeaturesService,
    PackagesService,
    AuthResolverService,
    RoleResolverService,
    NotificationsService,
    AnalyticsService,
    BillingCheckoutService,
    ExportReportService,
    FeedbackMsgService
  ],
  bootstrap: [AppComponent],
  entryComponents: [ 
    TripDetailsDialogComponent, 
    TripDatesDialogComponent,
    GuideDetailsDialogComponent, 
    BookingsDialogComponent, 
    FlightDetailsDialogComponent,
    TravellerDetailsDialogComponent,
    AppFeaturesDialogComponent,
    BillingDialogComponent,
    RegisterSuccessDialogComponent,
    DeleteConfimationDialogComponent,
    ConfirmationBoxComponent,
    AdminBillingDialogComponent
  ],
  exports:[SumTotalPipe]
})
export class AppModule { 
  constructor(overlayContainer: OverlayContainer) {
    overlayContainer.getContainerElement().classList.add('deeppurple-amber');
    // overlayContainer.themeClass = 'deeppurple-amber';
  }
}
