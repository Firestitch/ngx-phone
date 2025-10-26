import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { FsPhoneFieldComponent } from '../../../../src/app/components/phone-field/phone-field.component';
import { FsFormModule } from '@firestitch/form';
import { JsonPipe } from '@angular/common';
import { FsPhonePipe } from '../../../../src/app/pipes/phone-format.pipe';

@Component({
    selector: 'phone-input-with-string',
    templateUrl: './phone-input-with-string.component.html',
    styleUrls: ['./phone-input-with-string.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatFormField,
        MatLabel,
        MatInput,
        FormsModule,
        FsPhoneFieldComponent,
        FsFormModule,
        MatHint,
        JsonPipe,
        FsPhonePipe,
    ],
})
export class PhoneInputWithStringComponent {

  public model = '+1 (416) 373-4253 ext. 1234';
  public value;

  public changed(value) {
    this.value = value;
  }
}
