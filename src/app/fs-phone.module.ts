import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { FsPhoneDirective } from './directives/phone.directive';
import { FsPhonePipe } from './pipes/phone-format.pipe';


@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FsPhoneDirective,
    FsPhonePipe
  ],
  declarations: [
    FsPhoneDirective,
    FsPhonePipe
  ],
})
export class FsPhoneModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FsPhoneModule
    };
  }
}
