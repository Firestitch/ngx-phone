import { Component } from '@angular/core';

@Component({
  selector: 'phone-input-with-string-mode',
  templateUrl: './phone-input-with-string-mode.component.html',
  styleUrls: ['./phone-input-with-string-mode.component.css'],
})
export class PhoneInputWithStringModeComponent {

  public input = '+12133734253';

  public model = this.input;

  constructor() { }

  public changed(e) {
    console.log(e);
  }
}
