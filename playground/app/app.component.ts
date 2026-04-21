import { Component } from '@angular/core';

import { FsExampleModule } from '@firestitch/example';

import { environment } from '../environments/environment';

import { PhoneDisplayComponent } from './components/phone-display/phone-display.component';
import { PhoneInputWithStringComponent } from './components/phone-input-with-string/phone-input-with-string.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.scss',
  ],
  standalone: true,
  imports: [FsExampleModule, PhoneInputWithStringComponent, PhoneDisplayComponent],
})
export class AppComponent {
  public config = environment;
}
