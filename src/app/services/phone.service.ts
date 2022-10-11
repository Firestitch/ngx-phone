import { Injectable } from '@angular/core';

import {
  CountryCode,
  formatIncompletePhoneNumber,
  getExtPrefix,
  PhoneNumber,
  MetadataJson,
} from 'libphonenumber-js/core';
import { AsYouType, parsePhoneNumber } from 'libphonenumber-js';

import { IFsPhoneValue } from '../interfaces/phone-value.interface';
import { PhoneMetadataService } from './phone-metadata.service';


@Injectable({
  providedIn: 'root',
})
export class PhoneService {

  constructor(private _metadataService: PhoneMetadataService) {
  }

  public get metadata(): MetadataJson {
    return this._metadataService.metadata;
  }

  public formatIncompletePhoneNumber(countryCode: string, value: string, country: CountryCode): string {
    const typed = new AsYouType(country);
    typed.input(countryCode + value);

    let result = typed.getNumber()
      ?.formatInternational()
      .replace(countryCode, '');

    if (!result) { return ''; }

    // Double format to fix TA-T1894
    result = formatIncompletePhoneNumber(result, country, this.metadata)

    return result;
  }

  public parsePhoneNumber(value: string, countryCode?: CountryCode): PhoneNumber {
    let phoneNumber: PhoneNumber;

    try {
       phoneNumber = !!countryCode
         ? parsePhoneNumber(value, countryCode)
         : parsePhoneNumber(value);
    } catch (e) {
      throw new Error('Can not parse passed phone number. ' + e)
    }

    if (!phoneNumber.country) {
      phoneNumber.country = countryCode;
    }

    return phoneNumber;
  }

  public phoneNumberToPhoneValueObject(n: PhoneNumber) {
    return {
      code: '+' + n.countryCallingCode,
      countryCode: n.country,
      number: this.formatIncompletePhoneNumber('+' + n.countryCallingCode, n.nationalNumber as string, n.country),
      ext: n.ext as string,
    }
  }

  public isPhoneNumberValid(value: IFsPhoneValue): boolean {
    let phoneNumber: PhoneNumber;

    try {
      let phone = value.countryCode + value.number;

      if (value.countryCode.indexOf('+') !== 0) {
        phone = `+${phone}`;
      }

      phoneNumber = parsePhoneNumber(phone);

      return phoneNumber.isValid() || phoneNumber.isPossible();
    } catch (e) {
      return false;
    }
  }

  public formatPhoneNumber(value: IFsPhoneValue): string {
    const phoneNumber = parsePhoneNumber(`${value.countryCode}${value.number}`);

    return phoneNumber
      .formatInternational()
      .replace(value.countryCode, '')
      .trim();
  }

  public getExtPrefix(country: CountryCode) {
    return getExtPrefix(country, this.metadata);
  }
}
