import { Pipe, PipeTransform } from '@angular/core';

import { formatPhoneNumber } from '../helpers/format-phone-number';


@Pipe({
    name: 'fsPhone',
    standalone: true,
})
export class FsPhonePipe implements PipeTransform {

  // private _value: number | string | IPhoneValue;

  // private _displayValue = '';

  // private _ready = this._phoneMetadataService.ready;

  // private _transform$ = new ReplaySubject<number |string | IPhoneValue>(1)
  // private _destroy$ = new Subject<void>();

  /*constructor(
    private _cdRef: ChangeDetectorRef,
    private _phoneService: PhoneService,
    private _phoneMetadataService: PhoneMetadataService,
    private _countryService: FsCountry,
  ) {
    // this._listenTransformStream();
  }*/

  /*public ngOnDestroy(): void {
    this._destroy$.next(null);
    this._destroy$.complete();
  }*/

  /*
    private _listenTransformStream() {
      combineLatest([this._phoneMetadataService.ready$, this._countryService.ready$])
        .pipe(
          filter(([ metadataState, countryState]) => metadataState && countryState),
          switchMap(() => this._transform$),
          map((value) => this._transform(value))
        )
        .subscribe((value) => {
          this._displayValue = value;

          this._cdRef.markForCheck();
        })
    }

    private _transform(value) {
      this._fallbackParse(value);
    }

    private _transform(value) {
      let phoneNumber: PhoneNumber;
      let result = '';

      try {
        // In case when string received we must parse it before continue
        // otherwise we should transform passed object into PhoneNumber instance
        switch (typeof value) {
          case 'string': {
            phoneNumber = this._phoneService.parsePhoneNumber(value);
          } break;

          case 'number': {
            phoneNumber = this._phoneService.parsePhoneNumber(`${value}`);
          } break;

          case 'object': {
            debugger;
            phoneNumber = this._phoneService.parsePhoneNumber(`${value.code}${value.number}`);
            phoneNumber.ext = value.ext;
          } break;
        }

        const phoneValueObject = this._phoneService.phoneNumberToPhoneValueObject(phoneNumber);
        const country = this._countryService.countryByCode(phoneNumber.country);

        result = `${country.emoji} ${phoneValueObject.code} ${phoneValueObject.number}`;

        if (phoneNumber.ext) {
          const extText = this._phoneService.getExtPrefix(phoneNumber.country);

          result += ` ${extText} ${phoneNumber.ext}`;
        }

      } catch (e) {
        result = this._fallbackParse(value);
      }

      return result;
    }
  */

  public transform(value: number | string): string {
    if (!value) {
      return '';
    }

    // if (this._value !== value) {
    //   this._value = value;
    //
    //   if (!this._ready) {
    //     this._displayValue = this._fallbackParse(value);
    //   }
    //
    //   this._transform$.next(value);
    // }

    return this._fallbackParse(value);
  }

  private _fallbackParse(value: number | string) {
    const str = formatPhoneNumber(`${value}`);

    return str;
  }
}

