import {
  Directive,
  ElementRef,
  forwardRef,
  OnInit
} from '@angular/core';


import { NG_VALUE_ACCESSOR } from '@angular/forms';

import IMask from 'imask';
import { toString } from 'lodash-es';


@Directive({
  selector: '[fsPhone]',
  providers: [ {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FsPhoneDirective),
    multi: true
  } ]
})
export class FsPhoneDirective implements OnInit {

  private _imask;

  _onTouched = () => {};
  _onChange = (value: any) => {};

  registerOnChange(fn: (value: any) => any): void {
    this._onChange = fn
  }

  registerOnTouched(fn: () => any): void {
    this._onTouched = fn
  }

  constructor(private _elementRef: ElementRef) {
  }

  public ngOnInit() {
    const maskOptions = {
      mask: '(000) 000-0000'
    };

    this._imask = IMask(this._elementRef.nativeElement, maskOptions);
    this._imask.on('accept', () => {
      this._onChange(this._imask.unmaskedValue);
    });
  }

  private writeValue(value: any) {
    this._imask.value = toString(value);
  }
}
