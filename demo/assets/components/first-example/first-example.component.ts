import { Component } from '@angular/core';

@Component({
  selector: 'first-example',
  templateUrl: 'first-example.component.html',
  styleUrls: [ 'first-example.component.css' ]
})
export class FirstExampleComponent {
  public phone = 5555555555;

  constructor() {
  }

  changed(e) {
    console.log(e);
  }
}
