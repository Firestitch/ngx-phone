import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatSelectModule } from '@angular/material/select';

// Skeleton
import { FsSkeletonModule } from '@firestitch/skeleton';

// Components
import { FsPhoneDirective } from './directives/phone.directive';
import { FsPhonePipe } from './pipes/phone-format.pipe';
import { FsPhoneComponent } from './components/phone/phone.component';


@NgModule({
  imports: [
    CommonModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule,
    FsSkeletonModule,
  ],
  exports: [
    FsPhoneComponent,
    FsPhoneDirective,
    FsPhonePipe,
  ],
  declarations: [
    FsPhoneComponent,
    FsPhoneDirective,
    FsPhonePipe
  ],
})
export class FsPhoneModule {
  static forRoot(): ModuleWithProviders<FsPhoneModule> {
    return {
      ngModule: FsPhoneModule
    };
  }
}
