import { CountryCode } from 'libphonenumber-js';

export interface IPhoneConfig {
  maskType: 'us' | 'ru',
  mask: string | null;
}

export interface IFsPhoneConfig {
  assetPath?: string;
  isoCountryCode?: CountryCode;
}
