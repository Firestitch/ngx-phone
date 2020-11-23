import { Component } from '@angular/core';

@Component({
  selector: 'phone-display',
  templateUrl: 'phone-display.component.html',
  styleUrls: [ 'phone-display.component.css' ]
})
export class PhoneDisplayComponent {
  public phoneNumber = 5555555555;
  public phoneString = '2133734253 ext. 1234';
  public phoneObject = {
    isoCode: 'US',
    countryCode: '1',
    number: '(213) 373-4253',
    emoji: '🇺🇸',
    ext: '1234',
  };

  constructor() {
  }

  changed(e) {
    console.log(e);
  }
}
