import { AfterViewInit, Directive, DoCheck, ElementRef, forwardRef, HostListener, Inject, KeyValueDiffer, KeyValueDiffers, Input,Output, OnInit, Optional ,EventEmitter,Injector} from "@angular/core";
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator,NgModel } from "@angular/forms";

import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from "./currency-mask.config";
import { InputHandler } from "./input.handler";

export const CURRENCYMASKDIRECTIVE_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CurrencyMaskDirective),
    multi: true
};

@Directive({
    selector: "[currencyMask]",
    providers: [
        CURRENCYMASKDIRECTIVE_VALUE_ACCESSOR,
        { provide: NG_VALIDATORS, useExisting: CurrencyMaskDirective, multi: true },
    ]
})
export class CurrencyMaskDirective implements AfterViewInit, ControlValueAccessor, DoCheck, OnInit, Validator {

    @Input() max: number;
    @Input() min: number;
    @Input() options: any = {};
    @Input() ngModelMoney:any;
    @Output() ngModelMoneyChange:EventEmitter<any> = new EventEmitter<any>();

    inputHandler: InputHandler;
    keyValueDiffer: KeyValueDiffer<any, any>;
    isIonic: any;
    ngModel:any;

    optionsTemplate = {
        align: "right",
        allowNegative: true,
        decimal: ".",
        precision: 2,
        prefix: "$ ",
        suffix: "",
        thousands: ",",
        isIonic:false
    };

    constructor(@Optional() @Inject(CURRENCY_MASK_CONFIG) private currencyMaskConfig: CurrencyMaskConfig, private elementRef: ElementRef, private keyValueDiffers: KeyValueDiffers, private injector: Injector) {
        if (currencyMaskConfig) {
            this.optionsTemplate = currencyMaskConfig;
        }

        this.keyValueDiffer = keyValueDiffers.find({}).create();
    }

    ngAfterViewInit() {
        this.isIonic = this.options.isIonic ? this.options.isIonic : this.optionsTemplate.isIonic;
        
        if(this.isIonic){
            setTimeout(() => {
                this.elementRef.nativeElement.children[0].style.textAlign = this.options.align ? this.options.align : this.optionsTemplate.align;
            },0);
        }else{
            this.elementRef.nativeElement.style.textAlign = this.options.align ? this.options.align : this.optionsTemplate.align;
        }
    }

    ngDoCheck() {
        if (this.keyValueDiffer.diff(this.options)) {
            if(this.isIonic){
                setTimeout(() => {
                    this.elementRef.nativeElement.children[0].style.textAlign = this.options.align ? this.options.align : this.optionsTemplate.align;
                    this.inputHandler.updateOptions((<any>Object).assign({}, this.optionsTemplate, this.options));
                },0);
            }else{
                this.elementRef.nativeElement.style.textAlign = this.options.align ? this.options.align : this.optionsTemplate.align;
                this.inputHandler.updateOptions((<any>Object).assign({}, this.optionsTemplate, this.options));
            }
        }
    }

    ngOnInit() {
        this.isIonic = this.options.isIonic ? this.options.isIonic : this.optionsTemplate.isIonic;
        this.ngModel = this.injector.get(NgModel);

        if(this.ngModel)
            this.inputHandler.setNgModel(this.ngModel);


        if(this.isIonic){
            setTimeout(() => {
                this.inputHandler = new InputHandler(this.elementRef.nativeElement.children[0], (<any>Object).assign({}, this.optionsTemplate, this.options));
            },0)
        }else{
            this.inputHandler = new InputHandler(this.elementRef.nativeElement, (<any>Object).assign({}, this.optionsTemplate, this.options));
        }
    }

    @HostListener("blur", ["$event"])
    handleBlur(event: any) {
        if(this.isIonic){
            this.ngModel.update.emit(this.inputHandler.getMaskedValue(this.ngModelMoney));
        }else{
            this.inputHandler.getOnModelTouched().apply(event);
        }
    }

    @HostListener("click", ["$event"])
    handleClick(event: any) {
        this.inputHandler.handleClick(event, this.isChromeAndroid());
    }

    @HostListener("cut", ["$event"])
    handleCut(event: any) {
        if (!this.isChromeAndroid()) {
            if(this.isIonic)
                this.inputHandler.handleCut(event, this.ngModelMoneyChange);
            else
                this.inputHandler.handleCut(event); 
        }
    }

    @HostListener("input", ["$event"])
    handleInput(event: any) {
        if (this.isChromeAndroid()) {
            if(this.isIonic)
                this.inputHandler.handleInput(event, this.ngModelMoneyChange);
            else    
               this.inputHandler.handleInput(event);
        }
    }

    @HostListener("keydown", ["$event"])
    handleKeydown(event: any) {
        if (!this.isChromeAndroid()) {
            if(this.isIonic)
                this.inputHandler.handleKeydown(event, this.ngModelMoneyChange);
            else    
                this.inputHandler.handleKeydown(event); 
        }
    }

    @HostListener("keypress", ["$event"])
    handleKeypress(event: any) {
        if (!this.isChromeAndroid()) {
            if(this.isIonic)
                this.inputHandler.handleKeypress(event, this.ngModelMoneyChange);
            else
                this.inputHandler.handleKeypress(event);
        }
    }

    @HostListener("keyup", ["$event"])
    handleKeyup(event: any) {
        if (!this.isChromeAndroid()) {  
            this.inputHandler.handleKeyup(event);
        }
    }

    @HostListener("paste", ["$event"])
    handlePaste(event: any) {
        if (!this.isChromeAndroid()) {
            if(this.isIonic)
                this.inputHandler.handlePaste(event, this.ngModelMoneyChange);
            else    
                this.inputHandler.handlePaste(event);
        }
    }

    isChromeAndroid(): boolean {
        return /chrome/i.test(navigator.userAgent) && /android/i.test(navigator.userAgent);
    }

    registerOnChange(callbackFunction: Function): void {
        this.inputHandler.setOnModelChange(callbackFunction);
    }

    registerOnTouched(callbackFunction: Function): void {
        this.inputHandler.setOnModelTouched(callbackFunction);
    }

    setDisabledState(value: boolean): void {
        this.elementRef.nativeElement.children[0].disabled = value;
    }

    validate(abstractControl: AbstractControl): { [key: string]: any; } {
        let result: any = {};

        if (abstractControl.value > this.max) {
            result.max = true;
        }

        if (abstractControl.value < this.min) {
            result.min = true;
        }

        return result != {} ? result : null;
    }

    writeValue(value: number): void {
        this.inputHandler.setValue(value);
    }
}