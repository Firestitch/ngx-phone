import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self,
  ViewChild
} from '@angular/core';

import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NgControl, ValidationErrors,
  Validator,
} from '@angular/forms';

import { MatFormFieldControl } from '@angular/material/form-field';

import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { FocusMonitor } from '@angular/cdk/a11y';


import { combineLatest, Observable, ReplaySubject, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { FsCountry, IFsCountry } from '@firestitch/country';

import { CountryCode, PhoneNumber } from 'libphonenumber-js';

import { IPhoneValue } from '../../interfaces/phone-value.interface';
import { PhoneService } from '../../services/phone.service';
import { PhoneMetadataService } from '../../services/phone-metadata.service';


@Component({
  selector: 'fs-phone-field',
  templateUrl: './phone-field.component.html',
  styleUrls: [
    './phone-field.component.scss',
  ],
  providers: [
    {provide: MatFormFieldControl, useExisting: FsPhoneFieldComponent},
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FsPhoneFieldComponent
  implements OnInit, OnDestroy, ControlValueAccessor, MatFormFieldControl<IPhoneValue | string>, Validator {

  public static nextId = 0;

  @Input()
  @HostBinding('class.with-number-extention')
  public allowNumberExt = false;

  @Input()
  public set placeholder(placeholder: string) {
    this._placeholder = placeholder;
    this.stateChanges.next();
  }

  @Input()
  public set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  @Input()
  public set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.phoneNumberParts.disable() : this.phoneNumberParts.enable();

    this.stateChanges.next();
  }

  @Input()
  public mode: 'string' | 'object' = 'object';

  @HostBinding()
  public id = `example-tel-input-${FsPhoneFieldComponent.nextId++}`;

  public phoneNumberParts: FormGroup;

  public focused = false;
  public errorState = false;
  public controlType = 'phone-input';
  public stateChanges = new Subject<void>();
  public extPrefix = '';
  public countryControl = new FormControl('');
  public ready$: Observable<boolean>;

  @ViewChild('phoneNumberInput')
  private _phoneNumberInputRef: ElementRef;

  @ViewChild('countryInput', { read: ElementRef })
  private _countryInputRef: ElementRef;

  private _externalDataReady = false;
  private _placeholder: string;
  private _required = false;
  private _disabled = false;
  private _writeValue$ = new ReplaySubject<IPhoneValue | string>(1);
  private _destroy$ = new Subject<void>();

  // Value Accessor
  private _onTouched = () => {};
  private _onChange: (value: IPhoneValue | string) => void = () => {};

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private _fb: FormBuilder,
    private _fm: FocusMonitor,
    private _el: ElementRef,
    private _phone: PhoneService,
    private _countriesStore: FsCountry,
    private _metadata: PhoneMetadataService,
  ) {
    this._initControls();
    this._registerValueAccessor();
    this._registerFocusMonitor();
    this._initResourcesReadyState();
  }

  public get countries$(): Observable<IFsCountry[]> {
    return this._countriesStore.countries$;
  }

  public get value(): IPhoneValue | string {
    let value = this.phoneNumberParts.value as IPhoneValue;

    if (this.mode === 'string') {
      // const phoneNumber = value.number.replace(/[^0-9.]/g, '');
      let phoneNumberString = `${value.code}${value.number}`;

      if (value.ext && this.countryControl.value) {
        phoneNumberString += ` ${this._phone.getExtPrefix(this.countryControl.value)} ${value.ext}`
      }

      return phoneNumberString;
    } else {
      // if (value.number) {
      //   value.number = value.number.replace(/[^0-9.]/g, '');
      // }

      if (this.countryControl.value) {
        const country = this._countriesStore.countryByCode(this.countryControl.value)

        value = {
          ...value,
          country: country.code,
          countryEmoji: country.emoji,
        };
      }

      return value;
    }
  }

  public get placeholder(): string {
    return this._placeholder;
  }

  public get required(): boolean {
    return this._required;
  }

  public get disabled(): boolean {
    return this._disabled;
  }

  @HostBinding('class.floating')
  public get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  public get empty(): boolean {
    if (this.mode === 'object') {
      return !this.codeValue && !this.numberValue && this._externalDataReady;
    } else {
      return !this.value && this._externalDataReady;
    }
  }

  public get codeValue(): string {
    return this.phoneNumberParts.get('code').value;
  }

  public get numberValue(): string {
    return this.phoneNumberParts.get('number').value;
  }

  public get extValue(): string {
    return this.phoneNumberParts.get('ext').value;
  }


  public ngOnInit(): void {
    this._applyInternalValidation();
    this._listenWriteValue();
    this._listenPhonePartsChanges();
    this._listenCountryChanges();
    this._applyMaterialHacks();
  }

  public ngOnDestroy(): void {
    this._fm.stopMonitoring(this._el);
    this.stateChanges.complete();
  }

  public onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this._countryInputRef.nativeElement.focus();
    }
  }

  public setDescribedByIds(ids: string[]) { }

  public writeValue(value: IPhoneValue | string) {
    this._writeValue$.next(value);
  }

  public registerOnChange(onChange: (value: IPhoneValue) => void): void {
    this._onChange = onChange;
  }

  public registerOnTouched(onTouched: () => void): void {
    this._onTouched = onTouched;
  }

  public validate({ value }: FormControl) {

    const validationErrors: ValidationErrors = {};
    let isNotValid = false;

    if (this.required) {
      const hasValue = this.codeValue && this.numberValue;

      if (!hasValue) {
        isNotValid = true;
        validationErrors.required = true;
      }
    }

    if (this.codeValue && this.numberValue) {
      if (!this._phone.isPhoneNumberValid(this.phoneNumberParts.value)) {
        isNotValid = true;
        validationErrors.invalid = 'Invalid phone number';
      }
    }

    return isNotValid && validationErrors;
  }

  private _registerValueAccessor(): void {
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }
  }

  private _registerFocusMonitor(): void {
    this._fm.monitor(this._el, true)
      .pipe(
        filter(() => !this.disabled),
      )
      .subscribe((origin) => {
        this.focused = !!origin;
        this.stateChanges.next();
      })
  }

  private _initControls(): void {
    this.phoneNumberParts = this._fb.group({
      code: '',
      number: '',
      ext: '',
    });
  }

  private _initResourcesReadyState(): void {
    this.ready$ = combineLatest([this._countriesStore.ready$, this._metadata.ready$])
      .pipe(
        map(([countriesReady, metadataReady]) => {
          return countriesReady && metadataReady;
        }),
        tap((state) => {
          this._externalDataReady = state;
          this.stateChanges.next();
        }),
        shareReplay(1),
      )
  }

  private _listenPhonePartsChanges() {
    this.phoneNumberParts.valueChanges
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((value: any) => {
        if (value.code && value.number && value.number.length > 0) {
          const formattedValue = this._phone
            .formatIncompletePhoneNumber(value.number, this.countryControl.value as CountryCode);

          this._directUpdatePhoneNumberValue(formattedValue);
        }

        if (this.empty) {
          this._onChange(null);
        } else {
          this._onChange(this.value);
        }

        this.stateChanges.next();
      });
  }

  private _listenCountryChanges() {
    this.countryControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this._destroy$),
      )
      .subscribe((countryCode) => {
        const country = this._countriesStore.countryByCode(countryCode);
        this._updateExt(countryCode as CountryCode);

        if (country) {
          this.phoneNumberParts.patchValue({ code: '+' + country.callingCode });
        } else {
          this.phoneNumberParts.patchValue({ code: '' });
        }
      });
  }

  /**
   * mat form field underline must have auto width
   */
  private _applyMaterialHacks(): void {
    this._el.nativeElement.parentElement.style.width = 'auto';
  }

  /**
   * Required and Invalid validators are custom
   */
  private _applyInternalValidation() {
    if (this.ngControl) {
      this.ngControl.control.setValidators([this.validate.bind(this)]);
    }
  }

  private _directUpdatePhoneNumberValue(value: string) {
    if (this._phoneNumberInputRef) {
      // For cases when we have moved from simple string to formatted to save cursor position correct
      // ex. 23 => (234)
      const prevValueLength = this._phoneNumberInputRef.nativeElement.value.length;
      const newValueLength = value.length;

      const cursorPosition = this._phoneNumberInputRef.nativeElement.selectionStart
        + (newValueLength - prevValueLength);

      // Update input value
      this._phoneNumberInputRef.nativeElement.value = value;

      // Restore cursor position
      setTimeout(() => {
        this._phoneNumberInputRef.nativeElement.setSelectionRange(cursorPosition, cursorPosition);
      }, 5);
    }
  }

  private _updateExt(code: CountryCode) {
    this.extPrefix = this._phone.getExtPrefix(code);
  }

  private _listenWriteValue() {
    this.ready$
      .pipe(
        filter((state) => !!state),
        switchMap(() => {
          return this._writeValue$;
        }),
      )
      .subscribe((value) => {
        this._writeValue(value);
      })
  }

  private _writeValue(value: IPhoneValue | string) {
    let phoneNumber: PhoneNumber;

    // In case when string received we must parse it before continue
    // otherwise we should transform passed object into PhoneNumber instance
    if (typeof value === 'string') {
      phoneNumber = this._phone.parsePhoneNumber(value);
    } else if (value && typeof value === 'object') {
      phoneNumber = this._phone.parsePhoneNumber(`${value.code}${value.number}`);
      phoneNumber.ext = value.ext;
    }

    // If transformed to PhoneNumber correctly
    if (phoneNumber) {
      if (!phoneNumber.isValid()) {
        throw Error('Invalid phone number');
      }

      const phoneValueObject = this._phone.phoneNumberToPhoneValueObject(phoneNumber);

      this.countryControl.patchValue(phoneValueObject.countryCode, { emitEvent: false });

      this.phoneNumberParts.patchValue({
        code: phoneValueObject.code || '',
        number: phoneValueObject.number,
        ext: phoneValueObject.ext || '',
      }, { emitEvent: false });

      this._updateExt(phoneValueObject.countryCode as CountryCode);
    } else {
      this.phoneNumberParts.reset({
        code: '',
        number: '',
        ext: '',
      }, { emitEvent: false });
    }
  }
}
