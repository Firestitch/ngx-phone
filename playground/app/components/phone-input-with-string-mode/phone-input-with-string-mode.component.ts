import { Component } from '@angular/core';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { FsPhoneFieldDeprecatedComponent } from '../../../../src/app/components/phone-field-deprecated/phone-field-deprecated.component';
import { FormsModule } from '@angular/forms';
import { FsFormModule } from '@firestitch/form';
import { JsonPipe } from '@angular/common';
import { FsPhonePipe } from '../../../../src/app/pipes/phone-format.pipe';

@Component({
    selector: 'phone-input-with-string-mode',
    templateUrl: './phone-input-with-string-mode.component.html',
    styleUrls: ['./phone-input-with-string-mode.component.css'],
    standalone: true,
    imports: [
        MatFormField,
        MatLabel,
        FsPhoneFieldDeprecatedComponent,
        FormsModule,
        FsFormModule,
        MatHint,
        JsonPipe,
        FsPhonePipe,
    ],
})
export class PhoneInputWithStringModeComponent {

  public input = '+12133734253';

  public model = this.input;

  constructor() { }

  public changed(e) {
    console.log(e);
  }
}
