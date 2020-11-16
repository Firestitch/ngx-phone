import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FsPhoneModule } from '@firestitch/phone';
import { FsExampleModule } from '@firestitch/example';
import { FsFormModule } from '@firestitch/form';
import { FsMessageModule } from '@firestitch/message';

import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { FsMaterialModule } from './material.module';
import { FirstExampleComponent } from './components/first-example/first-example.component';
import { PhoneInputWithObjectComponent } from './components/phone-input-with-object/phone-input-with-object.component';
import { PhoneInputWithStringComponent } from './components/phone-input-with-string/phone-input-with-string.component';
import { PhoneInputWithStringModeComponent } from './components/phone-input-with-string-mode/phone-input-with-string-mode.component';
import { PhoneDisplayComponent } from './components/phone-display/phone-display.component';


@NgModule({
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    FsPhoneModule.forRoot(),
    BrowserAnimationsModule,
    FsMaterialModule,
    FormsModule,
    FsFormModule,
    FsMessageModule.forRoot(),
    FsExampleModule.forRoot(),
    ToastrModule.forRoot({ preventDuplicates: true }),
    FsFormModule.forRoot(),
  ],
  entryComponents: [],
  declarations: [
    AppComponent,
    FirstExampleComponent,

    PhoneInputWithObjectComponent,
    PhoneInputWithStringComponent,
    PhoneInputWithStringModeComponent,
    PhoneDisplayComponent,
  ],
  providers: [],
})
export class PlaygroundModule {
}
