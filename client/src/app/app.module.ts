import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CookieService } from 'angular2-cookie/services/cookies.service';

import { AppRoutingModule } from './app-routing.module';
import { AuthService } from './services/index';

import { AppComponent }  from './app.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  imports:      [ BrowserModule, AppRoutingModule ],
  declarations: [ AppComponent, LoginComponent, DashboardComponent ],
  providers: [ 
  	CookieService,
  	AuthService
  ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
