import { ChangeDetectionStrategy, Component } from '@angular/core';

import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { FsFormModule } from '@firestitch/form';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FsPhoneFieldComponent } from '../../../../src/app/components/phone-field/phone-field.component';
import { FsCommonModule } from '@firestitch/common';
import { MatButton } from '@angular/material/button';
import { JsonPipe } from '@angular/common';
import { FsPhonePipe } from '../../../../src/app/pipes/phone-format.pipe';


@Component({
    selector: 'phone-input-with-object',
    templateUrl: './phone-input-with-object.component.html',
    styleUrls: ['./phone-input-with-object.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        FormsModule,
        FsFormModule,
        MatFormField,
        MatLabel,
        MatInput,
        FsPhoneFieldComponent,
        FsCommonModule,
        MatHint,
        MatButton,
        JsonPipe,
        FsPhonePipe,
    ],
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
