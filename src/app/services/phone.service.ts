import { Injectable } from '@angular/core';
import { toString } from 'lodash';
import { PHONE_MASKS } from '../helpers/phone-masks';

const INPUT_PLACEHOLDER = '_';

@Injectable()
export class FsPhone {

  public determineMask(maskType, mask) {
    if (maskType && PHONE_MASKS[maskType]) {
      return PHONE_MASKS[maskType]
    } else if (mask) return mask;
  }

  // moves caret out of pre-set zone
  public getCaretDelta(caret, mask) {
    let delta = 1;
    while (typeof mask[caret + delta] === 'string') delta++;
    return delta;
  }

  // determines exact caret positions
  public caretPosition(caret, mask, value) {
    let moveTo = caret;
    for (let i = caret; i <= moveTo; i++) {
      if (typeof mask[i] === 'string') moveTo++;
    }
    return moveTo;
  }

  // determines where to put caret when focused
  public getFirstAvailableCaretPos(mask) {
    for (let i = 0; i <= mask.length - 1; i++) {
      if (typeof mask[i] != 'string') {
        return i;
      }
    }
  }


  //holding it in case of future use
  // public leftArrowCaretPosition(caret, mask) {
  //     let suitablePos = caret;
  //     for(let i = caret; i>=0; i--) {
  //
  //         if(typeof mask[i-1] == 'string') {
  //
  //             suitablePos = i-1;
  //             return this.leftArrowCaretPosition(suitablePos, mask);
  //         } else if (typeof mask[i-1] == 'undefined') { //if there is no mask at this point, means we have reached the very beginning without finding a single input place, so returning an error code
  //             return -1;
  //         } else return suitablePos;
  //     }
  //
  //     return suitablePos;
  // }

  public combineRegexes(mask): { regex: string, index: number }[] {
    const regexArr = [];
    mask.forEach((maskVal, i) => {
      if (typeof maskVal == 'object') {
        regexArr.push({
          regex: maskVal,
          index: i
        })
      }
    });
    return regexArr;
  }

  // text-mask consists of two types of elements - simple characters to be put for user visual and
  // regexes to be replaced with user inputs. this function extracts characters which fit into regex
  // and that dont overflow with string-characters (e.g. +1)
  public getFittingArr(value, mask, regexArr) {
    const valueArr = toString(value).split('');

    let regexCounter = 0;
    const fittingValues = [];
    for (let i = 0; i < valueArr.length; i++) {
      const regex = regexArr[regexCounter];
      if (regex && regex.regex.test(mask[i])) {
      } else if (regex && valueArr[i] && regex.regex.test(valueArr[i])) {
        regexCounter++;
        fittingValues.push({
          index: regex.index,
          value: valueArr[i]
        });
      }
    }

    return fittingValues;
  }

  // determines if current symbol is valid for user input
  public isValidForInput(symbol, i, mask) {
    return (typeof mask[i] === 'object' && mask[i].test(symbol));
  }

  // main function of formatting the value into the regex + characters from text-mask
  public formatValue(fittingValues: any[], mask: any[]): any {
    const res = [];
    //
    if (fittingValues && fittingValues.length) {
      for (let i = 0; i <= fittingValues[fittingValues.length - 1].index; i++) {
        if (typeof mask[i] == 'string') res[i] = mask[i];
      }

      fittingValues.forEach(value => {
        res[value.index] = value.value;
      });

      for (let i = res.length; i < mask.length; i++) {
        if (typeof mask[i] == 'string') res[i] = mask[i];
        else res[i] = INPUT_PLACEHOLDER;
      }

      return this.cutIt(res.join(''), mask);

    } else return '';

  }

  public getPhoneWithoutMask(value: string) {
    const result = value.match(/\d/g);
    return result ? result.join('') : '';
  }

  // fills in the value from user input
  private fillInValue(valueArr, mask, i) {
    if (valueArr[i + 1] == INPUT_PLACEHOLDER) valueArr.splice(i + 1, 1);
    return valueArr;
  }

  // recurselivly goes through the textmask and replaces regexes with fitting characters
  private replaceRecursive(valueArr: string[], mask: any[], i: number): string[] {

    // if its a constant
    if (typeof mask[i] == 'string') {
      if (valueArr[i] == mask[i]) return this.replaceRecursive(valueArr, mask, ++i);
      else {
        const tmp = valueArr[i];
        valueArr[i] = mask[i];
        if (tmp) valueArr[i + 1] = tmp;
        return this.replaceRecursive(valueArr, mask, i + 1);
      }
    } else if (typeof mask[i] == 'object') { // if its a RegExp
      if (!valueArr[i]) valueArr[i] = INPUT_PLACEHOLDER;
      valueArr = this.fillInValue(valueArr, mask, i);
      return this.replaceRecursive(valueArr, mask, ++i);
    } else {

      return valueArr;
    }
  }


  // cuts the string to text-mask length
  private cutIt(value: string, mask: any[]): string {
    return value.slice(0, mask.length);
  }

  // returns initial value of input
  public getInitialValue(mask: any[] = null): string {
    let res = '';

    mask.forEach(maskElem => {
      if (typeof maskElem == 'string') res = res + maskElem;
      else res = res + INPUT_PLACEHOLDER;
    });

    return res;
  }


}
