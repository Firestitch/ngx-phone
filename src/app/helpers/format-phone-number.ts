import { parsePhoneNumber } from 'libphonenumber-js';

export function formatPhoneNumber(str: string, options?: { format: 'international' | 'national' }): string {
  try {
    const phoneNumber = parsePhoneNumber(str);

    let formatted = '';

    if((options?.format || 'national') === 'national') {
      formatted = phoneNumber.formatNational();
    } else if(options?.format === 'international') {
      formatted = phoneNumber.formatNational();
    }

    return formatted.trim();

  } catch (e) {
    return str;
  }
}

