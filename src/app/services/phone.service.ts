import { Injectable } from '@angular/core';

import {
  CountryCode,
  formatIncompletePhoneNumber,
  parsePhoneNumber,
  getExtPrefix,
  PhoneNumber,
  Metadata,
} from 'libphonenumber-js/core';

// import * as phNumber from 'libphonenumber-js/es6/PhoneNumber';
// import * as _fr from 'libphonenumber-js/es6/format'

// import metadata from 'libphonenumber-js/metadata.full.json';

import { IFsPhoneValue } from '../interfaces/phone-value.interface';
import { PhoneMetadataService } from './phone-metadata.service';


@Injectable({
  providedIn: 'root',
})
export class PhoneService {

  constructor(private _metadataService: PhoneMetadataService) {
  }

  public get metadata(): Metadata {
    return this._metadataService.metadata;
  }

  public formatIncompletePhoneNumber(value: string, country: CountryCode): string {
    const result = formatIncompletePhoneNumber(value, country, this.metadata);

    if (!result) { return ''; }

    return result;
  }

  public parsePhoneNumber(value: string): PhoneNumber {
    let phoneNumber: PhoneNumber;

    try {
       phoneNumber = parsePhoneNumber(value, this.metadata);
    } catch (e) {
      throw new Error('Can not parse passed phone number. ' + e)
    }

    return phoneNumber;
  }

  public phoneNumberToPhoneValueObject(n: PhoneNumber) {
    return {
      code: '+' + n.countryCallingCode,
      countryCode: n.country,
      number: this.formatIncompletePhoneNumber(n.nationalNumber as string, n.country),
      ext: n.ext as string,
    }
  }

  public isPhoneNumberValid(value: IFsPhoneValue): boolean {
    let phoneNumber: PhoneNumber;

    try {
      phoneNumber = parsePhoneNumber(value.countryCode + value.number, this.metadata);

      return phoneNumber.isValid() || phoneNumber.isPossible();
    } catch (e) {
      return false;
    }
  }

  public formatPhoneNumber(value: IFsPhoneValue): string {
    const phoneNumber = parsePhoneNumber(`${value.countryCode}${value.number}`, this.metadata);

    return phoneNumber
      .formatInternational()
      .replace(value.countryCode, '')
      .trim();
  }

  public getExtPrefix(country: CountryCode) {
    return getExtPrefix(country, this.metadata);
  }
}
