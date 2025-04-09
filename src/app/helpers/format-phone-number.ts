import { parsePhoneNumber } from 'libphonenumber-js';

export function formatPhoneNumber(str: string, options?: { format: 'international' | 'national' }): string {
  try {
    return _formatPhoneNumber(str, options);
  } catch (e) {
    const cleanStr = str.toString().replace(/[^\d]/g, '');

    if(cleanStr.length === 10) {
      try {
        return _formatPhoneNumber(`+1 ${cleanStr}`);
      } catch (e) {
        //
      }
    }

    return str;
  }
}

function _formatPhoneNumber(str: string, options?: { format: 'international' | 'national' }): string {
  const phoneNumber = parsePhoneNumber(str);

  let formatted = '';
  if((options?.format || 'national') === 'national') {
    formatted = phoneNumber.formatNational();
  } else if(options?.format === 'international') {
    formatted = phoneNumber.formatNational();
  }

  return formatted.trim();
}
