import { Injector, ModuleWithProviders, NgModule, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatSelectModule } from '@angular/material/select';

// Skeleton
import { FsSkeletonModule } from '@firestitch/skeleton';
import { FsCountryModule } from '@firestitch/country';

// Components
import { FsPhoneComponent } from './components/phone/phone.component';
import { FsPhoneFieldComponent } from './components/phone-field/phone-field.component';
import { FsPhoneDirective } from './directives/phone.directive';
import { FsPhonePipe } from './pipes/phone-format.pipe';
import { IFsPhoneConfig } from './interfaces/phone-config.interface';
import { FS_PHONE_CONFIG } from './providers/fs-phone-config';
import { PHONE_CONFIG, PHONE_CONFIG_ROOT } from './providers';
import { FsPhoneField1Component } from './components/phone-field1/phone-field1.component';



@NgModule({
  imports: [
    CommonModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule,
    FsSkeletonModule,
    FsCountryModule,
  ],
  exports: [
    FsPhoneComponent,
    FsPhoneFieldComponent,
    FsPhoneField1Component,
    FsPhoneDirective,
    FsPhonePipe,
  ],
  declarations: [
    FsPhoneComponent,
    FsPhoneFieldComponent,
    FsPhoneField1Component,
    FsPhoneDirective,
    FsPhonePipe,
  ],
})
export class FsPhoneModule {
  static forRoot(config: IFsPhoneConfig = {}): ModuleWithProviders<FsPhoneModule> {
    return {
      ngModule: FsPhoneModule,
      providers: [
        { provide: PHONE_CONFIG_ROOT, useValue: config },
        {
          provide: PHONE_CONFIG,
          useFactory: phoneConfigFactory,
          deps: [PHONE_CONFIG_ROOT, [new Optional(), FS_PHONE_CONFIG]]
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
