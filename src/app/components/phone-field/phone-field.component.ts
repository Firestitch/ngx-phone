import {
  AfterContentInit,
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
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  NgControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  Validator,
} from '@angular/forms';

import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DomPortal, Portal } from '@angular/cdk/portal';
import { MatFormField, MatFormFieldControl } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { FsCountry, IFsCountry } from '@firestitch/country';

import { combineLatest, fromEvent, merge, Observable, ReplaySubject, Subject, timer } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  shareReplay,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';


import { AsYouType, CountryCode, parsePhoneNumberFromString, PhoneNumber } from 'libphonenumber-js';

import { IFsPhoneConfig } from '../../interfaces/phone-config.interface';
import { IFsPhoneValue } from '../../interfaces/phone-value.interface';
import { FS_PHONE_CONFIG } from '../../providers';
import { PhoneMetadataService } from '../../services/phone-metadata.service';
import { PhoneService } from '../../services/phone.service';


@Component({
  selector: '[fsPhoneField]',
  templateUrl: './phone-field.component.html',
  styleUrls: ['./phone-field.component.scss'],
  providers: [
    { provide: MatFormFieldControl, useExisting: FsPhoneFieldComponent },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FsPhoneFieldComponent implements OnInit, OnDestroy, ControlValueAccessor,
  MatFormFieldControl<IFsPhoneValue | string>, Validator, AfterContentInit {

  public static nextId = 0;

  @Input()
  @HostBinding('class.with-number-extention')
  public allowNumberExt = false;

  @Input()
  public set placeholder(placeholder: string) {
    this._placeholder = placeholder;
    this.stateChanges.next(null);
  }

  @Input()
  public set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next(null);
  }

  @Input()
  public set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    if (this._disabled) {
      this.countryControl.disable({ emitEvent: false });
    } else {
      this.countryControl.enable({ emitEvent: false });
    }

    this.stateChanges.next(null);
  }

  @Input()
  public mode: 'string' | 'object' = 'string';

  @Input()
  public country: CountryCode;

  @Input()
  public autocomplete = 'on';

  @HostBinding()
  public id = `example-tel-input-${FsPhoneFieldComponent.nextId++}`;

  public phoneNumberParts: UntypedFormGroup;
  public focused = false;
  public touched = false;
  public controlType = 'phone-input';
  public stateChanges = new Subject<void>();
  public extPrefix = '';
  public countryControl = new UntypedFormControl('');
  public ready$: Observable<boolean>;
  public selectedPortal: Portal<any>;

  @ViewChild('extNumberInput')
  private _extNumberInputRef: ElementRef;

  private _externalDataReady = false;
  private _placeholder: string;
  private _required = false;
  private _disabled = false;
  private _writeValue$ = new ReplaySubject<IFsPhoneValue | string>(1);
  private _containerClick = new Subject<Element>();
  private _countrySelectOpened$ = new Subject<null>();
  private _destroy$ = new Subject<void>();
  private _onTouched: () => void;
  private _onChange: (value: IFsPhoneValue | string) => void;

  constructor(
    @Optional()
    @Self()
    public ngControl: NgControl,
    @Optional()
    @Inject(FS_PHONE_CONFIG)
    private readonly _phoneConfig: IFsPhoneConfig,
    private _fb: UntypedFormBuilder,
    private _fm: FocusMonitor,
    private _el: ElementRef,
    private _phone: PhoneService,
    private _countriesStore: FsCountry,
    private _metadata: PhoneMetadataService,
    private _formField: MatFormField,
    private _matInput: MatInput,
  ) {
    this._initControls();
    this._registerValueAccessor();
    this._listenContainerClick();
    this._initResourcesReadyState();
  }

  public ngAfterContentInit(): void {
    const portal = new DomPortal(this._el.nativeElement);

    const el = this._el;

    el.nativeElement.childNodes.forEach((c) => {
      el.nativeElement.offsetParent.append(c);
    });

    this.selectedPortal = portal;
  }

  public get countries$(): Observable<IFsCountry[]> {
    return this._countriesStore.countries$;
  }

  public get phoneNumberEl() {
    return this._el.nativeElement;
  }

  public get extNumberEl() {
    return this._extNumberInputRef.nativeElement;
  }

  public get emojiSupported(): boolean {
    return this._countriesStore.emojiSupported;
  }

  public get errorState(): boolean {
    return this.ngControl.dirty && !this.ngControl.valid;
  }

  public get value(): IFsPhoneValue | string {
    let value = {
      ...this.phoneNumberParts.value,
      number: this._matInput.value,
    } as IFsPhoneValue;

    if (this.mode === 'string') {
      // const phoneNumber = value.number.replace(/[^0-9.]/g, '');
      let phoneNumberString = `${value.countryCode} ${value.number}`;

      if (value.ext && this.countryControl.value) {
        phoneNumberString += ` ${this._phone.getExtPrefix(this.countryControl.value)} ${value.ext}`;
      }

      return phoneNumberString;
    }
    if (this.countryControl.value) {
      const country = this._countriesStore.countryByISOCode(this.countryControl.value);

      value = {
        countryCode: value.countryCode.replace('+', ''),
        ext: value.ext,
        number: value.number?.replace(/[^0-9]/g, ''),
        isoCode: country.isoCode,
        emoji: country.emoji,
      };
    }

    return value;

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
    }

    return !this.value && this._externalDataReady;
  }

  public get codeValue(): string {
    return this.phoneNumberParts.get('countryCode').value;
  }

  public get numberValue(): string {
    return this._matInput.value;
  }

  public get extValue(): string {
    return this.phoneNumberParts.get('ext').value;
  }

  public get countryIsoCodeValue(): string {
    return this.countryControl.value;
  }

  public ngOnInit(): void {
    this._initDefaultCountry();
    this._applyInternalValidation();
    this._listenWriteValue();
    this._listenPhonePartsChanges();
    this._listenCountryChanges();
    this._applyMaterialHacks();
    this._initEvents();
  }

  public ngOnDestroy(): void {
    this._fm.stopMonitoring(this._el);
    this.stateChanges.complete();
  }

  public formatInput(): void {
    if (this.phoneNumberEl) {
      const asYouType = new AsYouType(this.countryControl.value);

      this.phoneNumberEl.value = asYouType.input(this.phoneNumberEl.value);
    }
  }

  public phonePaste(): void {
    setTimeout(() => {
      this.phoneFormat();
    });
  }

  public phoneFormat(): void {
    const phoneNumber = parsePhoneNumberFromString(this.phoneNumberEl.value, this.countryControl.value);
    if (phoneNumber) {
      phoneNumber.ext = this.extValue;
      this.phoneNumberEl.value = phoneNumber.formatInternational();
      this._setPhoneNumber(phoneNumber);
    }
  }

  public phoneKeydown(event: KeyboardEvent): void {
    if (
      this.allowNumberExt &&
      event.code === 'ArrowRight' &&
      this.phoneNumberEl.selectionStart === this.phoneNumberEl.value.length
    ) {
      this.focusExtNumber();

      return;
    }
  }

  public phoneKeypress(event: KeyboardEvent): void {
    const regEx = new RegExp(/[^\d\)\(\s\-)]/, 'g');
    if (event.key && event.key.match(regEx)) {
      event.preventDefault();
    }
  }

  public phoneKeyup(event: KeyboardEvent): void {
    if (!event.key.match(/[\d]/) &&
      (
        event.code === 'Backspace' ||
        event.code === 'Delete' ||
        event.key === 'Tab' ||
        event.key === 'Control' ||
        event.key === 'Shift' ||
        event.key === 'Meta' ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
    ) {
      return;
    }

    try {
      const input = this.phoneNumberEl;
      const value = input.value;
      const asYouType = new AsYouType(this.countryControl.value);
      const formatted = asYouType.input(value);

      if (input.value.length === input.selectionStart) {
        if (event.code === 'Backspace' && !asYouType.isValid()) {
          return;
        }

        input.value = formatted;

        if (asYouType.isValid()) {
          this.phoneFormat();
        }
      }

      if (this.allowNumberExt &&
        event.key.match(/\d/) &&
        ['US', 'CA'].indexOf(this.countryIsoCodeValue) !== -1 &&
        asYouType.isValid()
      ) {
        this.selectExtNumber();
      }
    } catch (error) {
    }
  }

  public focusExtNumber(): void {
    setTimeout(() => {
      this.extNumberEl.focus();
    });
  }

  public selectExtNumber(): void {
    setTimeout(() => {
      this.extNumberEl.select();
    });
  }

  public focusPhoneNumber(): void {
    setTimeout(() => {
      this.phoneNumberEl.focus();
    });
  }

  public extKeyup(event: KeyboardEvent): void {
    if (event.code === 'Backspace') {
      if (this.extNumberEl.selectionStart === 0) {
        this.focusPhoneNumber();
      }
    }
  }

  public extKeydown(event: KeyboardEvent): void {
    if (
      event.code === 'ArrowLeft' &&
      this.extNumberEl.selectionStart === 0
    ) {
      this.focusPhoneNumber();

      return;
    }
  }

  public onContainerClick(event: MouseEvent) {
    this._containerClick.next(event.target as Element);
  }

  public countrySelectOpened(): void {
    this._countrySelectOpened$.next(null);
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

  public validate({ value }: UntypedFormControl) {
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
      if (!this._phone.isPhoneNumberValid(this.value)) {
        isNotValid = true;
        validationErrors.invalid = 'Invalid number';
      }
    }

    return isNotValid && validationErrors;
  }

  public onFocusIn(event: FocusEvent) {
    if (!this.focused) {
      this.focused = true;
      this.stateChanges.next(null);
    }
  }

  public onFocusOut(event: FocusEvent) {
    if (!this._el.nativeElement.contains(event.relatedTarget as Element)) {
      this.touched = true;
      this.focused = false;
      this._onTouched();
      this.stateChanges.next(null);
    }
  }

  public countrySelectionChange() {
    this.formatInput();
  }

  private _registerValueAccessor(): void {
    if (this.ngControl !== null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;

      this.ngControl.statusChanges
        .subscribe((state) => {
          this.disabled = state === 'DISABLED';
        });
    }
  }

  private _listenContainerClick(): void {
    this._containerClick
      .pipe(
        filter(() => !this.disabled),
        filter((target: Element) => {
          return target.tagName.toLowerCase() !== 'input';
        }),
        switchMap(() =>
          merge(
            timer(200).pipe(mapTo(false)),
            this._countrySelectOpened$.pipe(mapTo(true)),
          ).pipe(
            take(1),
          ),
        ),
        tap((isSelectClick: boolean) => {
          if (!isSelectClick) {
            this._fm.focusVia(this._el, 'program');
          }
        }),
        takeUntil(this._destroy$),
      )
      .subscribe();
  }

  private _initDefaultCountry(): void {
    this.country = this.country || this._phoneConfig?.isoCountryCode;
  }

  private _initControls(): void {
    this._formField.floatLabel = 'always';
    this.phoneNumberParts = this._fb.group({
      countryCode: '',
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
          this.stateChanges.next(null);
        }),
        shareReplay(1),
      );
  }

  private _listenPhonePartsChanges() {
    merge(
      this.phoneNumberParts.valueChanges,
    )
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        this._phonePartsChange();
      });

    fromEvent(this.phoneNumberEl, 'input')
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        this._phonePartsChange();
      });
  }

  private _phonePartsChange() {
    if (this.empty) {
      this._onChange(null);
    } else {
      this._onChange(this.value);
    }

    this.stateChanges.next(null);
  }

  private _listenCountryChanges() {
    this.countryControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this._destroy$),
      )
      .subscribe((countryCode: CountryCode) => {
        this._setCountryCode(countryCode);
      });
  }

  /**
   * mat form field underline must have auto width
   */
  private _applyMaterialHacks(): void {
    this._el.nativeElement.parentElement.style.width = 'auto';
  }

  private _initEvents(): void {
    merge(
      fromEvent(this.phoneNumberEl, 'keyup'),
      fromEvent(this.phoneNumberEl, 'keydown'),
      fromEvent(this.phoneNumberEl, 'keypress'),
      fromEvent(this.phoneNumberEl, 'paste'),
      fromEvent(this.phoneNumberEl, 'blur'),
    )
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((event: Event) => {
        switch (event.type) {
          case 'keyup':
            return this.phoneKeyup(event as KeyboardEvent);

          case 'keydown':
            return this.phoneKeydown(event as KeyboardEvent);

          case 'keypress':
            return this.phoneKeypress(event as KeyboardEvent);

          case 'paste':
            return this.phonePaste();

          case 'blur':
            return this.phoneFormat();
        }
      });
  }

  /**
   * Required and Invalid validators are custom
   */
  private _applyInternalValidation() {
    if (this.ngControl) {
      this.ngControl.control.setValidators([this.validate.bind(this)]);
    }
  }

  private _updateExt(code: CountryCode) {
    this.extPrefix = code ? this._phone.getExtPrefix(code) : '';
  }

  private _listenWriteValue() {
    this.ready$
      .pipe(
        filter((state) => !!state),
        switchMap(() => {
          return this._writeValue$;
        }),
        takeUntil(this._destroy$),
      )
      .subscribe((value) => {
        this._writeValue(value);

        if (!value) {
          this._initWithDefaultCountry();
        }
      });
  }

  private _writeValue(value: IFsPhoneValue | string | number) {
    let phoneNumber: PhoneNumber;

    // In case when string received we must parse it before continue
    // otherwise we should transform passed object into PhoneNumber instance
    if (typeof value === 'string' || typeof value === 'number') {
      if (typeof value === 'number') {
        value = value.toString();
      }

      try {
        phoneNumber = this._phone.parsePhoneNumber(value, this.country);
      } catch (e) { }
    } else if (value && typeof value === 'object') {
      if (value.isoCode) {
        this.country = value.isoCode as any;
      }

      phoneNumber = this._phone.parsePhoneNumber(`+${value.countryCode}${value.number.toString()}`, this.country);

      if (phoneNumber) {
        phoneNumber.ext = value.ext;
      }
    }

    // If transformed to PhoneNumber correctly
    if (phoneNumber) {
      if (!phoneNumber.isPossible()) {
        throw Error('Invalid phone number');
      }

      this._setPhoneNumber(phoneNumber, false);
    } else {
      this.phoneNumberParts.reset({
        code: '',
        number: '',
        ext: '',
      }, { emitEvent: false });

      this._initWithDefaultCountry();
    }
  }

  private _setPhoneNumber(phoneNumber: PhoneNumber, emitEvent = true): void {
    const parsedNumber = this._phone.formatIncompletePhoneNumber(
      `+${phoneNumber.countryCallingCode}`,
      phoneNumber.nationalNumber as string,
      phoneNumber.country,
    );

    this.phoneNumberParts.patchValue({
      countryCode: phoneNumber.countryCallingCode || '',
      //number: parsedNumber,
      ext: phoneNumber.ext || '',
    }, { emitEvent });


    this._matInput.value = parsedNumber;

    this._setCountryCode(phoneNumber.country, emitEvent);
  }

  private _setCountryCode(isoCode: CountryCode, emitEvent = true): void {
    const country = this._countriesStore.countryByISOCode(isoCode);
    this.countryControl.patchValue(isoCode, { emitEvent });

    this._updateExt(isoCode);

    const data = country
      ? { countryCode: `+${country.countryCode}` }
      : { countryCode: '' };

    this.phoneNumberParts.patchValue(data, { emitEvent });
  }

  private _initWithDefaultCountry(): void {
    this.countryControl.setValue(this.country, { emitEvent: false });
    this._setCountryCode(this.country, false);
  }
}
