import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'phone-input-with-string',
  templateUrl: './phone-input-with-string.component.html',
  styleUrls: ['./phone-input-with-string.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhoneInputWithStringComponent {

  public model = '+1 (416) 373-4253 ext. 1234';
  public value;

  public changed(value) {
    this.value = value;
  }
}
