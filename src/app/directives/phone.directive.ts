import {
  Directive,
  ElementRef,
  forwardRef,
  OnInit,
  HostListener
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

  @HostListener('focus') onfocus() {
    const length = this._elementRef.nativeElement.value.length;
    setTimeout(() => {
      this._elementRef.nativeElement.setSelectionRange(length, length);
    }, 5);
  }

  @HostListener('keyup') input() {
    this._onChange(this._imask.unmaskedValue);
  }

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
  }

  public writeValue(value: any) {
    this._imask.value = toString(value);
  }
}
