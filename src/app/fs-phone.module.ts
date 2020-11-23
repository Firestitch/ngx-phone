import { ModuleWithProviders, NgModule } from '@angular/core';
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
    FsPhoneDirective,
    FsPhonePipe,
  ],
  declarations: [
    FsPhoneComponent,
    FsPhoneFieldComponent,
    FsPhoneDirective,
    FsPhonePipe,
  ],
})
export class FsPhoneModule {
  static forRoot(): ModuleWithProviders<FsPhoneModule> {
    return {
      ngModule: FsPhoneModule
    };
  }
}
