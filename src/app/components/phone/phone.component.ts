import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FsCountry } from '@firestitch/country';

import { PhoneService } from '../../services/phone.service';
import {PhoneMetadataService } from '../../services/phone-metadata.service';
import { formatPhoneNumber } from '../../helpers/format-phone-number';
import { IFsPhoneValue } from '../../interfaces/phone-value.interface';


@Component({
  selector: 'fs-phone',
  templateUrl: './phone.component.html',
})
export class FsPhoneComponent implements OnChanges {

  @Input()
  public phone: number | string | IFsPhoneValue;

  private _formattedPhone: string;

  constructor(
    private _phone: PhoneService,
    private _countriesStore: FsCountry,
    private _metadata: PhoneMetadataService,
  ) {}

  public get formattedPhone(): string {
    return this._formattedPhone;
  }

  public get phoneIsObject() {
    return typeof this.phone === 'object';
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

