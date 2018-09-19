import { InputService } from "./input.service";

export class InputHandler {

    private inputService: InputService;
    private onModelChange: Function;
    private onModelTouched: Function;
    private htmlInputElement: HTMLInputElement;
    private ngModel:any;

    constructor(htmlInputElement: HTMLInputElement, options: any) {
        this.inputService = new InputService(htmlInputElement, options);
        this.htmlInputElement = htmlInputElement;
    }

    handleClick(event: any, chromeAndroid: boolean): void {
        let selectionRangeLength = Math.abs(this.inputService.inputSelection.selectionEnd - this.inputService.inputSelection.selectionStart);

        //if there is no selection and the value is not null, the cursor position will be fixed. if the browser is chrome on android, the cursor will go to the end of the number.
        if (selectionRangeLength == 0 && !isNaN(this.inputService.value)) {
            this.inputService.fixCursorPosition(chromeAndroid);
        }
    }

    handleCut(event: any, ngModelMoney?:any): void {
        if (this.isReadOnly()) {
            return;
        }

        setTimeout(() => {
            this.inputService.updateFieldValue();
            this.setValue(this.inputService.value);

            if(this.onModelChange)
                this.onModelChange(this.inputService.value);
            
            if(ngModelMoney)
                ngModelMoney.emit(this.inputService.value);

            if(this.ngModel && this.inputService.value)
                this.ngModel.update.emit(this.getMaskedValue(this.inputService.value.toString()));    
        }, 0);
    }

    handleInput(event: any, ngModelMoney?:any): void {
        if (this.isReadOnly()) {
            return;
        }

        let keyCode = this.getNewKeyCode(this.inputService.storedRawValue, this.inputService.rawValue);
        let rawValueLength = this.inputService.rawValue.length;
        let rawValueSelectionEnd = this.inputService.inputSelection.selectionEnd;
        let rawValueWithoutSuffixEndPosition = this.inputService.getRawValueWithoutSuffixEndPosition();
        let storedRawValueLength = this.inputService.storedRawValue.length;
        this.inputService.rawValue = this.inputService.storedRawValue;

        if ((rawValueSelectionEnd != rawValueWithoutSuffixEndPosition || Math.abs(rawValueLength - storedRawValueLength) != 1) && storedRawValueLength != 0) {
            this.setCursorPosition(event);
            return;
        }

        if (rawValueLength < storedRawValueLength) {
            if (this.inputService.value != 0) {
                this.inputService.removeNumber(8);
            } else {
                this.setValue(null);
            }
        }

        if (rawValueLength > storedRawValueLength) {
            switch (keyCode) {
                case 43:
                    this.inputService.changeToPositive();
                    break;
                case 45:
                    this.inputService.changeToNegative();
                    break;
                default:
                    if (!this.inputService.canInputMoreNumbers || (isNaN(this.inputService.value) && String.fromCharCode(keyCode).match(/\d/) == null)) {
                        return;
                    }

                    this.inputService.addNumber(keyCode);
            }
        }

        this.setCursorPosition(event);

        if(this.onModelChange)
            this.onModelChange(this.inputService.value);
        
        if(ngModelMoney)    
           ngModelMoney.emit(this.inputService.value);

        if(this.ngModel && this.inputService.value)
           this.ngModel.update.emit(this.getMaskedValue(this.inputService.value.toString()));    
    }

    handleKeydown(event: any, ngModelMoney?:any): void {
        if (this.isReadOnly()) {
            return;
        }

        let keyCode = event.which || event.charCode || event.keyCode;

        if (keyCode == 8 || keyCode == 46 || keyCode == 63272) {
            event.preventDefault();
            let selectionRangeLength = Math.abs(this.inputService.inputSelection.selectionEnd - this.inputService.inputSelection.selectionStart);

            if (selectionRangeLength == this.inputService.rawValue.length || this.inputService.value == 0) {
                this.setValue(null);

                if(this.onModelChange)
                  this.onModelChange(this.inputService.value);

                if(ngModelMoney)
                    ngModelMoney.emit(this.inputService.value);  
            }

            if (selectionRangeLength == 0 && !isNaN(this.inputService.value)) {
                this.inputService.removeNumber(keyCode);

                if(this.onModelChange)
                    this.onModelChange(this.inputService.value);

                if(ngModelMoney)
                    ngModelMoney.emit(this.inputService.value);    
                
                if(this.ngModel && this.inputService.value)
                   this.ngModel.update.emit(this.getMaskedValue(this.inputService.value.toString()));      
            }

            if ((keyCode === 8 || keyCode === 46) && selectionRangeLength != 0 && !isNaN(this.inputService.value)) {
                this.inputService.removeNumber(keyCode);

                if(this.onModelChange)
                    this.onModelChange(this.inputService.value);

                if(ngModelMoney)
                    ngModelMoney.emit(this.inputService.value);
                    
                if(this.ngModel && this.inputService.value)
                    this.ngModel.update.emit(this.getMaskedValue(this.inputService.value.toString()));     
            }
        }
    }

    handleKeypress(event: any, ngModelMoney?:any): void {
        if (this.isReadOnly()) {
            return;
        }

        let keyCode = event.which || event.charCode || event.keyCode;

        if (keyCode == undefined || [9, 13].indexOf(keyCode) != -1 || this.isArrowEndHomeKeyInFirefox(event)) {
            return;
        }

        switch (keyCode) {
            case 43:
                this.inputService.changeToPositive();
                break;
            case 45:
                this.inputService.changeToNegative();
                break;
            default:
                if (this.inputService.canInputMoreNumbers && (!isNaN(this.inputService.value) || String.fromCharCode(keyCode).match(/\d/) != null)) {
                    this.inputService.addNumber(keyCode);
                }
        }

        event.preventDefault();

        if(this.onModelChange)
            this.onModelChange(this.inputService.value);

        if(ngModelMoney)
            ngModelMoney.emit(this.inputService.value);   
        
        if(this.ngModel && this.inputService.value)
            this.ngModel.update.emit(this.getMaskedValue(this.inputService.value.toString())); 
    }

    handleKeyup(event: any): void {
        this.inputService.fixCursorPosition();
    }

    handlePaste(event: any, ngModelMoney?:any): void {
        if (this.isReadOnly()) {
            return;
        }

        setTimeout(() => {
            this.inputService.updateFieldValue();
            this.setValue(this.inputService.value);

            if(this.onModelChange)
                 this.onModelChange(this.inputService.value);

            if(ngModelMoney)
              ngModelMoney.emit(this.inputService.value);
            
            if(this.ngModel && this.inputService.value)
              this.ngModel.update.emit(this.getMaskedValue(this.inputService.value.toString()));   
        }, 1);
    }

    updateOptions(options: any): void {
        this.inputService.updateOptions(options);
    }

    getOnModelChange(): Function {
        return this.onModelChange;
    }

    setNgModel(ngModel: any)
    {
        this.ngModel = ngModel;
    }

    setOnModelChange(callbackFunction: Function): void {
        this.onModelChange = callbackFunction;
    }

    getOnModelTouched(): Function {
        return this.onModelTouched;
    }

    setOnModelTouched(callbackFunction: Function) {
        this.onModelTouched = callbackFunction;
    }

    setValue(value: number): void {
        this.inputService.value = value;
    }

    getValue()
    {
        return this.inputService.value;
    }

    getMaskedValue(value: string)
    {
        return this.inputService.applyMask(true, value);
    }

    private getNewKeyCode(oldString: string, newString: string): number {
        if (oldString.length > newString.length) {
            return null;
        }

        for (let x = 0; x < newString.length; x++) {
            if (oldString.length == x || oldString[x] != newString[x]) {
                return newString.charCodeAt(x);
            }
        }
    }

    private isArrowEndHomeKeyInFirefox(event: any) {
        if ([35, 36, 37, 38, 39, 40].indexOf(event.keyCode) != -1 && (event.charCode == undefined || event.charCode == 0)) {
            return true;
        }

        return false;
    }

    private isReadOnly() {
        return this.htmlInputElement && this.htmlInputElement.readOnly;
    }

    private setCursorPosition(event: any): void {
        let rawValueWithoutSuffixEndPosition = this.inputService.getRawValueWithoutSuffixEndPosition();

        setTimeout(function () {
            event.target.setSelectionRange(rawValueWithoutSuffixEndPosition, rawValueWithoutSuffixEndPosition);
        }, 0);
    }
}