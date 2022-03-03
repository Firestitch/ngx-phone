import { IFsPhoneValue } from '../interfaces/phone-value.interface';
// import { IFsPhoneData } from '../interfaces/entity-with-phone-data';


export function setPhoneData<T = any>(target: T, phone: IFsPhoneValue): T {
  const result: any = {
    ...target,
    phone: phone?.number,
    phoneCountry: phone?.isoCode,
    phoneCountryCode: parseInt(phone.countryCode, 10) ?? null,
  };

  if (phone.ext) {
    result.phoneExt = phone.ext;
  }

  return result;
}

