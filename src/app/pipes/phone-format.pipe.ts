import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fsPhone' })
export class FsPhonePipe implements PipeTransform {
  transform(str: any): string {

      const cleaned = ('' + str).replace(/\D/g, '');

      if (!cleaned.length) {
        return '';
      }

      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})(\d*)/);

      let formatted = '';
      if (match) {
        formatted = '(' + match[1] + ') ' + match[2] + '-' + match[3];

        if (match[4]) {
          formatted += ' ext. ' + match[4];
        }
      };

      return formatted;
  }
}

