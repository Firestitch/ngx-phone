import { CountryCode } from 'libphonenumber-js';

export interface IPhoneConfig {
  maskType: 'us' | 'ru',
  mask: string | null;
}

export interface IFsPhoneConfig {
  metadataPath?: string;
  isoCountryCode?: CountryCode;
}
