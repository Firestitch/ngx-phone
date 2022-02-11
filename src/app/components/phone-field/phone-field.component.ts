import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Inject,
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

import { IFsPhoneValue } from '../../interfaces/phone-value.interface';
import { PhoneService } from '../../services/phone.service';
import { PhoneMetadataService } from '../../services/phone-metadata.service';
import { FS_PHONE_CONFIG } from '../../providers/phone-config';
import { IFsPhoneConfig } from '../../interfaces/phone-config.interface';
import { parenthesesClosed } from '../../helpers/have-not-closed-parentesis';


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
  implements OnInit, OnDestroy, ControlValueAccessor, MatFormFieldControl<IFsPhoneValue | string>, Validator {

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

  @Input()
  public country: CountryCode = null;

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
  private _writeValue$ = new ReplaySubject<IFsPhoneValue | string>(1);
  private _destroy$ = new Subject<void>();

  // Value Accessor
  private _onTouched = () => {};
  private _onChange: (value: IFsPhoneValue | string) => void = () => {};

  constructor(
    @Optional()
    @Self()
    public ngControl: NgControl,
    private _fb: FormBuilder,
    private _fm: FocusMonitor,
    private _el: ElementRef,
    private _phone: PhoneService,
    private _countriesStore: FsCountry,
    private _metadata: PhoneMetadataService,
    @Optional()
    @Inject(FS_PHONE_CONFIG)
    private readonly _phoneConfig: IFsPhoneConfig,
  ) {
    this._initControls();
    this._registerValueAccessor();
    this._registerFocusMonitor();
    this._initResourcesReadyState();
  }

  public get countries$(): Observable<IFsCountry[]> {
    return this._countriesStore.countries$;
  }

  public get emojiSupported(): boolean {
    return this._countriesStore.emojiSupported;
  }

  public get value(): IFsPhoneValue | string {
    let value = this.phoneNumberParts.value as IFsPhoneValue;

    if (this.mode === 'string') {
      // const phoneNumber = value.number.replace(/[^0-9.]/g, '');
      let phoneNumberString = `${value.countryCode}${value.number}`;

      if (value.ext && this.countryControl.value) {
        phoneNumberString += ` ${this._phone.getExtPrefix(this.countryControl.value)} ${value.ext}`
      }

      return phoneNumberString;
    } else {
      // if (value.number) {
      //   value.number = value.number.replace(/[^0-9.]/g, '');
      // }

      if (this.countryControl.value) {
        const country = this._countriesStore.countryByISOCode(this.countryControl.value)

        value = {
          countryCode: value.countryCode.replace('+', ''),
          ext: value.ext,
          number: value.number,
          isoCode: country.isoCode,
          emoji: country.emoji,
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
    return true;
  }

  public get empty(): boolean {
    if (this.mode === 'object') {
      return !this.codeValue && !this.numberValue && this._externalDataReady;
    } else {
      return !this.value && this._externalDataReady;
    }
  }

  public get codeValue(): string {
    return this.phoneNumberParts.get('countryCode').value;
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
      this._phoneNumberInputRef.nativeElement.focus();
    }
  }

  public setDescribedByIds(ids: string[]) { }

  public writeValue(value: IFsPhoneValue | string) {
    this._writeValue$.next(value);
  }

  public registerOnChange(onChange: (value: IFsPhoneValue) => void): void {
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

        if (!this.focused) {
          this._onBlur();
        }

        this.stateChanges.next();
      })
  }

  private _initControls(): void {
    this.phoneNumberParts = this._fb.group({
      countryCode: '',
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
      .subscribe(() => {
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
      .subscribe((isoCode) => {
        this._setCountryCode(isoCode);
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

        if (!value) {
          this._initWithDefaultCountry();
        }
      })
  }

  private _writeValue(value: IFsPhoneValue | string) {
    let phoneNumber: PhoneNumber;

    // In case when string received we must parse it before continue
    // otherwise we should transform passed object into PhoneNumber instance
    if (typeof value === 'string') {
      phoneNumber = this._phone.parsePhoneNumber(value);
    } else if (value && typeof value === 'object') {

      if (value.isoCode) {
        phoneNumber = this._phone.parsePhoneNumber(value.number.toString(), value.isoCode as CountryCode);
      } else {
        phoneNumber = this._phone.parsePhoneNumber(`+${value.countryCode}${value.number}`);
      }

      phoneNumber.ext = value.ext;
    }

    // If transformed to PhoneNumber correctly
    if (phoneNumber) {
      if (!phoneNumber.isPossible()) {
        throw Error('Invalid phone number');
      }

      const phoneValueObject = this._phone.phoneNumberToPhoneValueObject(phoneNumber);

      this.countryControl.patchValue(phoneValueObject.countryCode, { emitEvent: false });

      this.phoneNumberParts.patchValue({
        countryCode: phoneValueObject.code || '',
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

  private _setCountryCode(isoCode: CountryCode, emitEvent = true): void {
    const country = this._countriesStore.countryByISOCode(isoCode);

    this._updateExt(isoCode);

    const data = country
      ? { countryCode: `+${country.countryCode}` }
      : { countryCode: '' };

    this.phoneNumberParts.patchValue(data, { emitEvent: emitEvent });
  }

  private _initWithDefaultCountry(): void {
    const defaultISOCode = this._phoneConfig?.country || this.country || null;

    this.countryControl.setValue(defaultISOCode, { emitEvent: false });
    this._setCountryCode(defaultISOCode, false);
  }

  private _onBlur(): void {
    const value = this.phoneNumberParts.value;

    if (value.countryCode && value.number && value.number.length > 0) {
      const formattedValue = this._phone
        .formatIncompletePhoneNumber(value.number, this.countryControl.value as CountryCode);

      this._directUpdatePhoneNumberValue(formattedValue);
    }
  }
}
