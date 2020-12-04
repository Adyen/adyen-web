import { CallbacksConfig } from '../types';

const noop = () => {};

export function configureCallbacks(callbacksObj: CallbacksConfig = ({} as any) as CallbacksConfig): void {
    // --
    this.callbacks.onLoad = callbacksObj.onLoad ? callbacksObj.onLoad : noop;

    this.callbacks.onConfigSuccess = callbacksObj.onConfigSuccess ? callbacksObj.onConfigSuccess : noop;

    this.callbacks.onFieldValid = callbacksObj.onFieldValid ? callbacksObj.onFieldValid : noop;

    this.callbacks.onAllValid = callbacksObj.onAllValid ? callbacksObj.onAllValid : noop;

    this.callbacks.onBrand = callbacksObj.onBrand ? callbacksObj.onBrand : noop;

    this.callbacks.onError = callbacksObj.onError ? callbacksObj.onError : noop;

    this.callbacks.onFocus = callbacksObj.onFocus ? callbacksObj.onFocus : noop;

    this.callbacks.onBinValue = callbacksObj.onBinValue ? callbacksObj.onBinValue : noop;

    this.callbacks.onAutoComplete = callbacksObj.onAutoComplete ? callbacksObj.onAutoComplete : noop;

    this.callbacks.onAdditionalSFConfig = callbacksObj.onAdditionalSFConfig ? callbacksObj.onAdditionalSFConfig : noop;

    this.callbacks.onAdditionalSFRemoved = callbacksObj.onAdditionalSFRemoved ? callbacksObj.onAdditionalSFRemoved : noop;
}
