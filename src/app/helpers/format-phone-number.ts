import { parsePhoneNumber } from 'libphonenumber-js';

export type PhoneFormat = 'E164' | 'E123' | 'national';

export function formatPhoneNumber(str: string, format: PhoneFormat = 'national'): string {
  try {
    return _formatPhoneNumber(str, format);
  } catch (e) {
    const cleanStr = str.toString().replace(/[^\d]/g, '');

    if(cleanStr.length === 10) {
      try {
        return _formatPhoneNumber(`+1${cleanStr}`, format);
      } catch (e) {
        //
      }
    }

    return str;
  }
}

function _formatPhoneNumber(str: string, format: PhoneFormat): string {
  const phoneNumber = parsePhoneNumber(str);

  switch (format) {
    case 'E164':
      return phoneNumber.format('E.164') + (phoneNumber.ext ? `;ext=${phoneNumber.ext}` : '');

    case 'E123':
      return phoneNumber.formatInternational().trim();

    default:
      return phoneNumber.formatNational().trim();
  }
}
