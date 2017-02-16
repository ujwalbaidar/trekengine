import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CookieService } from 'angular2-cookie/services/cookies.service';
import { MaterialModule } from '@angular/material';
// import 'hammerjs';
import { FormsModule }   from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AuthService, UserService } from './services/index';

import { AppComponent }  from './app.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RegisterComponent } from './register/register.component';

@NgModule({
	imports:      [ 
  		BrowserModule, 
  		MaterialModule.forRoot(), 
  		AppRoutingModule,
  		FormsModule 
	],
  	declarations: [ 
	  	AppComponent, 
	  	LoginComponent, 
	  	DashboardComponent, 
	  	RegisterComponent 
	],
  	providers: [ 
  		CookieService,
  		AuthService, UserService
  	],
  	bootstrap:    [ AppComponent ]
})

export class AppModule { }
