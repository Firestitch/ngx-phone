import { Component } from '@angular/core';

@Component({
  selector: 'phone-display',
  templateUrl: './phone-display.component.html',
  styleUrls: ['./phone-display.component.css'],
})
export class PhoneDisplayComponent {
  public phoneNumber = 5555555555;
  public phoneString1 = '+1 4163734253 ext. 1234';
  public phoneString2 = '+1 (416)5558878';

  constructor() {
  }

  public changed(e) {
    console.log(e);
  }
}
