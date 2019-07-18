import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { FsPhoneDirective } from './directives/phone.directive';


@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FsPhoneDirective,
  ],
  declarations: [
    FsPhoneDirective,
  ],
})
export class FsPhoneModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FsPhoneModule
    };
  }
}
