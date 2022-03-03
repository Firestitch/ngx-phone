import { IFsPhoneValue } from '../interfaces/phone-value.interface';
import { IFsPhoneData } from '../interfaces/entity-with-phone-data';


export function extractPhoneData<T extends IFsPhoneData>(obj: T): IFsPhoneValue {
  const phone: IFsPhoneValue = {
    number: obj.phone?.toString(),
    countryCode: obj.phoneCountryCode?.toString(),
    isoCode: obj.phoneCountry,
  };

  if (obj.phoneExt) {
    phone.ext = obj.phoneExt;
  }

  return phone;
}
