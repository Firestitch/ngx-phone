import { FsPhone } from './services/fsphone.service';
import { PHONE_VALUE_ACCESSOR } from './fsphone.value-accessor';
import { NgControl } from '@angular/forms';
import { Directive, Input, Inject, Renderer, ElementRef, Pipe, OnInit } from '@angular/core';

/*
    Phone directive. Adds text-mask for any input-type HTML element. Has one working option right now: maskType: 'ru' | 'us', which can be easily extended by adding more phone mask constants in phone-masks.ts file.
    Consists the base of functionality of creating the universal text-mask component like https://github.com/text-mask/text-mask
    The struggle: easiest way of making this is ceating a real of shadow-DOM element, duplicating user's input, projecting all the user inputs in there and applying a mask on real element. This way in the easiest and would significantly decrease the code amount (and also the possibility of unaccounted behaviours), but would be less productive and would cause more glitches on non-standard ways of using it with components.
    By the way it works right now (only one element, all the calculations happen inside the service, separately) it's much more productive and can be used on any input element without messing up with HTML code (e.g. if developer using it would like to use jQuery, another libraries, would like to create his own element duplicate etc), but from other point adds more behaviors we could have missed usage-wise.
    In future to be perfected, a little optimised, worked on any use-case and can, indeed, become the best text-mask component on the market.
*/

@Directive({
    host: {
        '(input)': 'onChangeInterceptor($event)',
        '(keyup)': 'onKeyup($event)',
        '(keydown)': 'onKeydown($event)',
        '(tap)': 'onClick($event)',
        '(focus)': 'onFocused($event)',
        '(paste)': 'onPaste($event)',
        '(blur)': '_onTouched()'
    },
    selector: '[fsPhone]',
    providers: [PHONE_VALUE_ACCESSOR]
})
export class FsPhoneDirective implements OnInit {
    private mask;
    private regexes;
    private caretMove;

    // hack, because some events wont move caret on keydown
    private goOnKeyup;
    @Input('fsPhoneConfig')
    fsPhoneConfig = {
        maskType: 'us',
        mask: null
    }


    // event hooks for VALUE_ACCESSOR. those are used to imitate real input behavior
    // and emit events outside the directive, e.g. "touched"
    _onTouched = () => {

    }
    _onChange = (value: any) => { }
    onFocused = (event: any) => {
        this.setInitialValue(event);
    }

    // sets the initial value of text-mask when first focused or when cleared
    setInitialValue(event) {
        const value = event.target.value

        if (!value || !value.length) {
            this._elementRef.nativeElement.value = this.service.getInitialValue(this.mask);
            const caret = this.service.getFirstAvailableCaretPos(this.mask);
            event.target.setSelectionRange(caret, caret);
        }
    }


    // some of the keys cant be processed on keydown, because they only initiate functionality after keyup
    onKeyup = (event: any) => {
        if (
            event.key == 'Delete' ||
            event.key == 'Backspace'
        ) {
            this.setInitialValue(event);
        } else if (event.key == 'Home') {
            const caret = this.service.getFirstAvailableCaretPos(this.mask);
            event.target.setSelectionRange(caret, caret);
        }

        if (this.goOnKeyup) {
            event.target.setSelectionRange(this.goOnKeyup, this.goOnKeyup);
            delete this.goOnKeyup;
        }
    }

    // mouse click on input
    onClick = (event: any) => {
        this.manageCaret(event);
    }


    // one of hugest struggles - caret position on focus/copy-paste/deletion etc.
    // puts caret on first unfilled input place
    manageCaret(event) {
        let caret = event.target.selectionStart;
        if (event.target.value.indexOf('_') != -1 &&
            event.target.selectionStart > event.target.value.indexOf('_')) {
            caret = event.target.value.indexOf('_');
        } else {
          caret = this.trackCaret(event);
        }

        event.target.setSelectionRange(caret, caret);
    }

    // managemenet of unusual events on input, not just usual inputs
    onKeydown = (event: any) => {
        switch (event.key) {
            case 'Shift': break;
            case 'Meta': break;
            case 'ArrowRight': break;
            case 'ArrowLeft':
                if (!event.shiftKey && !event.metaKey) {
                    let caret = event.target.selectionStart;
                    if (this.service.getFirstAvailableCaretPos(this.mask) >= caret) {
                        caret = event.target.selectionStart + 1;
                    }
                    event.target.setSelectionRange(caret, caret);
                } else if (event.metaKey) {
                    this.goOnKeyup = this.service.getFirstAvailableCaretPos(this.mask);
                }
            break;
            case 'Backspace':
                this.trackCaret(event, -2);
            break;
            case 'Delete':
                this.caretMove = event.target.selectionStart - 1;
            break;
            default:
                this.trackCaret(event);
        }

    }

    onPaste = (event: any) => {
        delete this.caretMove;
    }

    // sets the caret based on event happened. has some HTML-glitch hacks
    trackCaret(event, preset = 0) {
        const caret = this.service.caretPosition(event.target.selectionStart, this.mask, event.target.value);

        this.caretMove = caret + preset;
        // means backspace
        if (preset == -2) {
            this.caretMove = event.target.selectionStart-2;
        }

        if (event.key && event.key.length == 1 && !this.service.isValidForInput(event.key, this.caretMove, this.mask)) {
            this.caretMove--;
        }

        return this.caretMove;
    }


    // we initiate those functions to emit events outside the component
    registerOnChange(fn: (value: any) => any): void { this._onChange = fn }
    registerOnTouched(fn: () => any): void { this._onTouched = fn }
    setDisabledState(isDisabled: boolean) {
        this.renderer.setElementProperty(this._elementRef.nativeElement, 'disabled', isDisabled)
    }


    constructor(
        @Inject(ElementRef) private _elementRef: ElementRef,
        @Inject(Renderer) private renderer: Renderer,
        private service: FsPhone
    ) {

    }

    // init functions
    ngOnInit() {
        this.mask = this.service.determineMask(this.fsPhoneConfig.maskType, this.fsPhoneConfig.mask);
        this.regexes = this.service.combineRegexes(this.mask);
    }

    // whenever user changes anything inside the input, this function is fired.
    // happens after the input, not wired on keypresses but on input value changes
    private onChangeInterceptor(event): void {
        const fittingValues = this.service.getFittingArr(
            event.target.value,
            this.mask,
            this.regexes
        )


        let newValue: string;
        newValue = this.service.formatValue(
            fittingValues,
            this.mask,
            event.target.selectionStart,
            event.element,
            this.regexes
        );


        this.writeValue(newValue, event.target.selectionStart, false);
        // this.manageCaret(event);
    }

    // main function used to re-write user input with the mask and emit changes out of the directive
    private writeValue(value: any, returnHere, initialCall = true): void {
      if (initialCall && !value) {
        return;
      }

      this.renderer.setElementProperty(this._elementRef.nativeElement, 'value', value);
      let caretDelta = 0;
      if (this.caretMove) {
          returnHere = this.caretMove + 1;
          delete this.caretMove;
      } else caretDelta = this.service.getCaretDelta(returnHere, this.mask);
      this._elementRef.nativeElement.setSelectionRange(returnHere + caretDelta, returnHere + caretDelta)

      this._onChange(value);
    }
}
