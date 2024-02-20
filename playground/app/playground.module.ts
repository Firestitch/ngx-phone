import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { FsCommonModule } from '@firestitch/common';
import { FsExampleModule } from '@firestitch/example';
import { FsFormModule } from '@firestitch/form';
import { FsMessageModule } from '@firestitch/message';
import { FsPhoneModule } from '@firestitch/phone';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { AppComponent } from './app.component';
import { FirstExampleComponent } from './components/first-example/first-example.component';
import { PhoneDisplayComponent } from './components/phone-display/phone-display.component';
import { PhoneInputWithObjectComponent } from './components/phone-input-with-object/phone-input-with-object.component';
import { PhoneInputWithStringModeComponent } from './components/phone-input-with-string-mode/phone-input-with-string-mode.component';
import { PhoneInputWithStringComponent } from './components/phone-input-with-string/phone-input-with-string.component';
import { FsMaterialModule } from './material.module';
import { RouterModule } from '@angular/router';


@NgModule({
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    FsPhoneModule.forRoot({
      isoCountryCode: 'US',
    }),
    BrowserAnimationsModule,
    FsMaterialModule,
    FormsModule,
    FsFormModule,
    FsCommonModule,
    RouterModule.forRoot([]),
    FsMessageModule.forRoot(),
    FsExampleModule.forRoot(),
    FsFormModule.forRoot(),
  ],
  declarations: [
    AppComponent,
    FirstExampleComponent,

    PhoneInputWithObjectComponent,
    PhoneInputWithStringComponent,
    PhoneInputWithStringModeComponent,
    PhoneDisplayComponent,
  ],
})
export class PlaygroundModule {
}
