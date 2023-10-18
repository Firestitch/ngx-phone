import {
  Directive,
  ElementRef,
  HostListener,
  OnInit,
  forwardRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import IMask from 'imask';
import { toString } from 'lodash-es';


@Directive({
  selector: '[fsPhone]',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FsPhoneDirective),
    multi: true,
  }],
})
export class FsPhoneDirective implements OnInit {

  private _imask;

  private _onTouched: () => void;
  private _onChange: (value: any) => void;

  constructor(private _elementRef: ElementRef) { }

  @HostListener('focus')
  public onfocus() {
    const length = this._elementRef.nativeElement.value.length;
    setTimeout(() => {
      this._elementRef.nativeElement.setSelectionRange(length, length);
    }, 5);
  }

  @HostListener('input')
  public input() {
    setTimeout(() => {
      this._onChange(this._imask.unmaskedValue);
    });
  }

  public registerOnChange(fn: (value: any) => any): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => any): void {
    this._onTouched = fn;
  }

  public ngOnInit() {
    const maskOptions = {
      mask: '(000) 000-0000 ext. 00000',
    };

    this._imask = IMask(this._elementRef.nativeElement, maskOptions);
  }

  public writeValue(value: any) {
    this._imask.value = toString(value);
  }
}
