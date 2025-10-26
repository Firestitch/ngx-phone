import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import { FsExampleModule } from '@firestitch/example';
import { PhoneInputWithObjectComponent } from './components/phone-input-with-object/phone-input-with-object.component';
import { PhoneInputWithStringComponent } from './components/phone-input-with-string/phone-input-with-string.component';
import { PhoneDisplayComponent } from './components/phone-display/phone-display.component';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: [
        './app.component.scss',
    ],
    standalone: true,
    imports: [FsExampleModule, PhoneInputWithObjectComponent, PhoneInputWithStringComponent, PhoneDisplayComponent]
})
export class AppComponent {
  public config = environment;
}
