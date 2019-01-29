import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { FsPhoneDirective } from './directives/phone.directive';
import { FsPhone } from './services/phone.service';


@NgModule({
  imports: [
    // Angular
    CommonModule
  ],
  exports: [
    FsPhoneDirective,
  ],
  entryComponents: [],
  declarations: [
    FsPhoneDirective,
  ],
  providers: [],
})
export class FsPhoneModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FsPhoneModule,
      providers: [ FsPhone ]
    };
  }
}
