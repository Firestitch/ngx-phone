import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Optional } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PortalModule } from '@angular/cdk/portal';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { FsCountryModule } from '@firestitch/country';
import { FsSkeletonModule } from '@firestitch/skeleton';

import { FsPhoneFieldDeprecatedComponent } from './components/phone-field-deprecated/phone-field-deprecated.component';
import { FsPhoneFieldComponent } from './components/phone-field/phone-field.component';
import { FsPhoneComponent } from './components/phone/phone.component';
import { FsPhoneDirective } from './directives/phone.directive';
import { IFsPhoneConfig } from './interfaces/phone-config.interface';
import { FsPhonePipe } from './pipes/phone-format.pipe';
import { PHONE_CONFIG, PHONE_CONFIG_ROOT } from './providers';
import { FS_PHONE_CONFIG } from './providers/fs-phone-config';


@NgModule({
  imports: [
    FormsModule,
    CommonModule,

    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,

    FsSkeletonModule,
    FsCountryModule,

    ReactiveFormsModule,
    PortalModule,
  ],
  exports: [
    FsPhoneComponent,
    FsPhoneFieldDeprecatedComponent,
    FsPhoneFieldComponent,
    FsPhoneDirective,
    FsPhonePipe,
  ],
  declarations: [
    FsPhoneComponent,
    FsPhoneFieldDeprecatedComponent,
    FsPhoneFieldComponent,
    FsPhoneDirective,
    FsPhonePipe,
  ],
})
export class FsPhoneModule {
  public static forRoot(config: IFsPhoneConfig = {}): ModuleWithProviders<FsPhoneModule> {
    return {
      ngModule: FsPhoneModule,
      providers: [
        { provide: PHONE_CONFIG_ROOT, useValue: config },
        {
          provide: PHONE_CONFIG,
          useFactory: phoneConfigFactory,
          deps: [PHONE_CONFIG_ROOT, [new Optional(), FS_PHONE_CONFIG]],
        },
      ],
    };
  }
}

export function phoneConfigFactory(config, fsConfig: IFsPhoneConfig) {
  return {
    ...fsConfig,
    ...config,
  };
}
