import { Component } from '@angular/core';

import { of } from 'rxjs';
import { delay } from 'rxjs/operators';


@Component({
  selector: 'phone-input-with-object',
  templateUrl: 'phone-input-with-object.component.html',
  styleUrls: [ 'phone-input-with-object.component.css' ]
})
export class PhoneInputWithObjectComponent {
  public input = {
    code: '+1',
    number: '2133734253'
  };

  public model = { ...this.input };

  constructor() {}

  public save = () => {
    return of(true)
      .pipe(
        delay(2000)
      );
  }
}
