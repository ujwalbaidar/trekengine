import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CookieService } from 'angular2-cookie/services/cookies.service';
// import 'hammerjs';
import { MaterialModule } from '@angular/material';
import { FormsModule }   from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AuthService, UserService } from './services/index';

import { AppComponent }  from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MovementComponent, TripDetailsComponent, TripDetailsDialogComponent } from './movements/index';

@NgModule({
	imports: [ 
		BrowserModule, 
		MaterialModule, 
		AppRoutingModule,
		FormsModule 
	],
	declarations: [ 
  	AppComponent, 
  	LoginComponent,
    HomeComponent, 
  	DashboardComponent,
    MovementComponent, TripDetailsComponent, TripDetailsDialogComponent,
  	RegisterComponent 
	],
  	providers: [ 
  		CookieService,
  		AuthService, UserService
  	],
  	bootstrap:    [ AppComponent ],
    entryComponents: [ TripDetailsDialogComponent ]
})

export class AppModule { }
