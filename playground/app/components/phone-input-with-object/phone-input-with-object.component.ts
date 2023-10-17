import { ChangeDetectionStrategy, Component } from '@angular/core';

import { of } from 'rxjs';
import { delay } from 'rxjs/operators';


@Component({
  selector: 'phone-input-with-object',
  templateUrl: './phone-input-with-object.component.html',
  styleUrls: ['./phone-input-with-object.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhoneInputWithObjectComponent {

  public model = '+1 (416) 373-4253';

  public save = () => {
    return of(true)
      .pipe(
        delay(2000),
      );
  };
}
