import { IFsPhoneValue } from '../interfaces/phone-value.interface';
import { IFsPhoneData } from '../interfaces/entity-with-phone-data';


export function extractPhoneData<T extends IFsPhoneData>(obj: T): IFsPhoneValue {
  const phone: IFsPhoneValue = {};

  if (!!obj.phone) {
    phone.number = obj.phone?.toString();
  }

  if (obj.phoneCountryCode) {
    phone.countryCode = obj.phoneCountryCode?.toString();
  }

  if (obj.phoneCountry) {
    phone.isoCode = obj.phoneCountry;
  }

  if (obj.phoneExt) {
    phone.ext = obj.phoneExt;
  }

  return phone;
}
