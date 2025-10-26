import { enableProdMode, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { environment } from './environments/environment';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { FsPhoneModule } from '@firestitch/phone';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { FsFormModule } from '@firestitch/form';
import { FsAclModule } from '@firestitch/acl';
import { FsCommonModule } from '@firestitch/common';
import { provideRouter } from '@angular/router';
import { FsMessageModule } from '@firestitch/message';
import { FsExampleModule } from '@firestitch/example';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, FsPhoneModule.forRoot({
            isoCountryCode: 'US',
        }), FormsModule, FsFormModule, FsAclModule, FsCommonModule, FsMessageModule.forRoot(), FsExampleModule.forRoot(), FsFormModule.forRoot()),
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: { floatLabel: 'auto', appearance: 'outline' },
        },
        provideAnimations(),
        provideRouter([]),
    ]
})
  .catch(err => console.error(err));

