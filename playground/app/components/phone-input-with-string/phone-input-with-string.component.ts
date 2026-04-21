import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { FsFormModule } from '@firestitch/form';

import { FsPhoneFieldComponent } from '../../../../src/app/components/phone-field/phone-field.component';
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
    FsPhonePipe,
  ],
})
export class PhoneInputWithStringComponent {

  public model = '+14163734253';

  public changed(value) {
    this.model = value;
  }
}
