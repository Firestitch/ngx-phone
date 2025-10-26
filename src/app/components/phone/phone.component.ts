import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { formatPhoneNumber } from '../../helpers/format-phone-number';
import { IFsPhoneValue } from '../../interfaces/phone-value.interface';
import { FsCountryModule } from '@firestitch/country';


@Component({
    selector: 'fs-phone',
    templateUrl: './phone.component.html',
    standalone: true,
    imports: [FsCountryModule],
})
export class FsPhoneComponent implements OnChanges {

  @Input()
  public phone: number | string | IFsPhoneValue;

  private _formattedPhone: string;

  public get formattedPhone(): string {
    return this._formattedPhone;
  }

  public get phoneIsObject() {
    return typeof this.phone === 'object';
  }

  public get phoneISOCode(): string {
    return (this.phone as IFsPhoneValue).isoCode;
  }

  public ngOnChanges(changes: SimpleChanges) {
    this._formattedPhone = this._parsePhone(this.phone);
  }

  private _parsePhone(value: number | string | IFsPhoneValue) {
    let str: string;

    switch (typeof value) {
      case 'number': {
        str = formatPhoneNumber('' + value);
      } break;

      case 'object': {
        str = `+${value.countryCode} ${value.number}`;

        if (value.ext) {
          str = `${str} ext. ${value.ext}`;
        }
      } break;

      default: {
        str = formatPhoneNumber(value);
      }
    }

    return str;
  }

}

