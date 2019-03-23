import {
  Directive,
  Input,
  ElementRef,
  Renderer2,
  Output,
  EventEmitter,
  OnChanges, Provider, forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BACKSPACE, DELETE, HOME } from '@angular/cdk/keycodes';

import { FsPhone } from '../services/phone.service';

import { PhoneConfigInterface } from '../interfaces/phone-config.interface';


export const PHONE_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => FsPhoneDirective),
  multi: true
};


/*
    Phone directive. Adds text-mask for any input-type HTML element. Has one working option right now: maskType:
    'ru' | 'us', which can be easily extended by adding more phone mask constants in phone-masks.ts file.
    Consists the base of functionality of creating the universal text-mask component
    like https://github.com/text-mask/text-mask
    The struggle: easiest way of making this is ceating a real of shadow-DOM element, duplicating user's input,
    projecting all the user inputs in there and applying a mask on real element. This way in the easiest and would
    significantly decrease the code amount (and also the possibility of unaccounted behaviours), but would be less
    productive and would cause more glitches on non-standard ways of using it with components.
    By the way it works right now (only one element, all the calculations happen inside the service, separately)
    it's much more productive and can be used on any input element without messing up with HTML code
    (e.g. if developer using it would like to use jQuery, another libraries, would like to create his own element
    duplicate etc), but from other point adds more behaviors we could have missed usage-wise.
    In future to be perfected, a little optimised, worked on any use-case and can, indeed,
    become the best text-mask component on the market.
*/

@Directive({
  host: {
    '(input)': 'onChangeHandler($event)',
    '(paste)': 'onPasteHandler($event)',
    '(keyup)': 'onKeyupHandler($event)',
    '(keydown)': 'onKeydownHandler($event)',
  },
  selector: '[fsPhone]',
  providers: [ PHONE_VALUE_ACCESSOR ]
})

export class FsPhoneDirective implements OnChanges {

  @Input('fsPhoneConfig')
  public fsPhoneConfig: PhoneConfigInterface = {
    maskType: 'us',
    mask: null
  };

  @Input() public ngModel = null;

  public onKeyupHandler = this.onKeuyp.bind(this);
  public onKeydownHandler = this.onKeydown.bind(this);
  public onPasteHandler = this.onPaste.bind(this);
  public onChangeHandler = this.onChangeInterceptor.bind(this);

  private mask: string[];
  private regexes: { regex: string, index: number }[];
  private caretMove;

  // hack, because some events wont move caret on keydown
  private goOnKeyup;


  // event hooks for VALUE_ACCESSOR. those are used to imitate real input behavior
  // and emit events outside the directive, e.g. "touched"
  _onTouched = () => {

  };

  _onChange = (value: any) => {

  };

  // we initiate those functions to emit events outside the component
  registerOnChange(fn: (value: any) => any): void {
    this._onChange = fn
  }

  registerOnTouched(fn: () => any): void {
    this._onTouched = fn
  }

  constructor(private _elementRef: ElementRef,
              private renderer: Renderer2,
              private service: FsPhone) {
  }

  public ngOnChanges(changes) {
    if (changes.ngModel.firstChange) {
      this.mask = this.service.determineMask(this.fsPhoneConfig.maskType, this.fsPhoneConfig.mask);
      this.regexes = this.service.combineRegexes(this.mask);
    }

    if (changes.ngModel && this.mask) {
      const fittingValues = this.service.getFittingArr(
        this.ngModel,
        this.mask,
        this.regexes
      );

      let newValue: string;
      newValue = this.service.formatValue(fittingValues, this.mask);
      setTimeout(() => this._elementRef.nativeElement.value = newValue, 0);
    }
  }

  /**
   * Some of the keys cant be processed on keydown, because they only initiate functionality after keyup
   * @param event
   */
  public onKeuyp(event: KeyboardEvent) {
    switch (event.keyCode) {
      case DELETE:
      case BACKSPACE: {

      }
        break;
      case HOME: {
        const caret = this.service.getFirstAvailableCaretPos(this.mask);
        this.setCaret(caret);
      }
    }

    if (this.goOnKeyup) {
      this.setCaret(this.goOnKeyup);
      this.goOnKeyup = null;
    }
  };

  /**
   * Managemenet of unusual events on input, not just usual inputs
   * @param event
   */
  public onKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Shift':
        break;
      case 'Meta':
        break;
      case 'ArrowRight':
        break;
      case 'ArrowLeft':
        if (!event.shiftKey && !event.metaKey) {
          let caret = (<HTMLInputElement>event.target).selectionStart;
          if (this.service.getFirstAvailableCaretPos(this.mask) >= caret) {
            caret += 1;
          }
          this.setCaret(caret);
        } else if (event.metaKey) {
          this.goOnKeyup = this.service.getFirstAvailableCaretPos(this.mask);
        }
        break;
      case 'Backspace':
        this.trackCaret(event, -2);
        break;
      case 'Delete':
        this.caretMove = (<HTMLInputElement>event.target).selectionStart - 1;
        break;
      default:
        this.trackCaret(event);
    }
  }

  public onPaste(event: any) {
    this.caretMove = void 0;
  }


  public setDisabledState(isDisabled: boolean) {
    this._elementRef.nativeElement.setAttribute('disabled', isDisabled);
  }

  /**
   *  Sets the initial value of text-mask when first focused or when cleared
   */
  private setInitialValue() {
    // const value = this.ngModel;

    // if (!value || !value.length) {
    //   this._elementRef.nativeElement.value = this.service.getInitialValue(this.mask);
    //   const caret = this.service.getFirstAvailableCaretPos(this.mask);
    //   this.setCaret(caret);
    // }
  }

  // whenever user changes anything inside the input, this function is fired.
  // happens after the input, not wired on keypresses but on input value changes
  private onChangeInterceptor(event) {
    const fittingValues = this.service.getFittingArr(
      event.target.value,
      this.mask,
      this.regexes
    );

    let newValue: string;
    newValue = this.service.formatValue(fittingValues, this.mask);
    this.ngModel = this.service.getPhoneWithoutMask(newValue);

    this._elementRef.nativeElement.value = newValue;
    let caretDelta = 0;
    let returnHere = event.target.selectionStart;
    if (this.caretMove) {
      returnHere = this.caretMove + 1;
      this.caretMove = void 0;
    } else {
      caretDelta = this.service.getCaretDelta(returnHere, this.mask);
    }
    this.setCaret(returnHere + caretDelta);
    this._onChange(this.ngModel);
  }

  /**
   *  Main function used to re-write user input with the mask and emit changes out of the directive
   */
  private writeValue(value: any) {

    this._elementRef.nativeElement.value = value;
    let caretDelta = 0;
    let returnHere = 0;
    if (this.caretMove) {
      returnHere = this.caretMove + 1;
      this.caretMove = void 0;
    } else {
      caretDelta = this.service.getCaretDelta(0, this.mask);
    }
    this.setCaret(returnHere + caretDelta);
  }

  /**
   * Set position for the caret
   */
  private setCaret(position) {
    this._elementRef.nativeElement.setSelectionRange(position, position);
  }

  /**
   *  One of hugest struggles - caret position on focus/copy-paste/deletion etc.
   *  puts caret on first unfilled input place
   */
  private manageCaret(event) {

  }

  /**
   * Sets the caret based on event happened. has some HTML-glitch hacks
   */
  private trackCaret(event, preset = 0) {
    const caret = this.service.caretPosition(event.target.selectionStart, this.mask, event.target.value); // todo ????

    this.caretMove = caret + preset;
    // means backspace
    if (preset == -2) {
      this.caretMove = event.target.selectionStart - 2;
    }

    if (event.key && event.key.length == 1 && !this.service.isValidForInput(event.key, this.caretMove, this.mask)) {
      this.caretMove--;
    }

    return this.caretMove;
  }

}
