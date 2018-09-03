import { FsPhoneDirective } from './fsphone.directive';
import { Provider, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms'

export const PHONE_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => FsPhoneDirective),
  multi: true
};
