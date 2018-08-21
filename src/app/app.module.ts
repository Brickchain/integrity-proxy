import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { IntegrityProxyModule } from 'integrity-proxy-lib';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    IntegrityProxyModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
