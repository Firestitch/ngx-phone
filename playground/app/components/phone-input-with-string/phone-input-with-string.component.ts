import { Component } from '@angular/core';

@Component({
  selector: 'phone-input-with-string',
  templateUrl: 'phone-input-with-string.component.html',
  styleUrls: [ 'phone-input-with-string.component.css' ]
})
export class PhoneInputWithStringComponent {
  public input = '+12133734253 ext. 1234';

  public model = this.input;

  constructor() {}

  changed(e) {
    console.log(e);
  }
}
