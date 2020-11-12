import { Injectable } from '@angular/core';

import {
  CountryCode,
  formatIncompletePhoneNumber,
  parsePhoneNumber,
  getExtPrefix,
  PhoneNumber,
} from 'libphonenumber-js/core';

// import * as phNumber from 'libphonenumber-js/es6/PhoneNumber';
// import * as _fr from 'libphonenumber-js/es6/format'

import metadata from 'libphonenumber-js/metadata.full.json';

import { IPhoneValue } from '../interfaces/phone-value.interface';


@Injectable()
export class PhoneService {

  public formatIncompletePhoneNumber(value: string, country: CountryCode): string {
    const result = formatIncompletePhoneNumber(value, country, metadata);

    if (!result) { return ''; }

    return result;
  }

  public parsePhoneNumber(value: string): PhoneNumber {
    let phoneNumber: PhoneNumber;

    try {
       phoneNumber = parsePhoneNumber(value, metadata);
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

  public isPhoneNumberValid(value: IPhoneValue): boolean {
    let phoneNumber: PhoneNumber;

    try {
      phoneNumber = parsePhoneNumber(value.code + value.number, metadata);

      return phoneNumber.isValid() || phoneNumber.isPossible();
    } catch (e) {
      return false;
    }
  }

  public formatPhoneNumber(value: IPhoneValue): string {
    const phoneNumber = parsePhoneNumber(`${value.code}${value.number}`, metadata);

    return phoneNumber
      .formatInternational()
      .replace(value.code, '')
      .trim();
  }

  public getExtPrefix(country: CountryCode) {
    return getExtPrefix(country, metadata);
  }
}
