import { SFFeedbackObj, StylesObject } from '../types';

export type RtnType_noParamVoidFn = () => void;
export type RtnType_postMessageListener = (event: Event) => void;
export type RtnType_callbackFn = (feedbackObj: SFFeedbackObj) => void;

interface SFInternalConfig {
    extraFieldData: string;
    txVariant: string;
    cardGroupTypes: string[];
    iframeUIConfig: IframeUIConfigObject;
    sfLogAtStart: boolean;
    trimTrailingSeparator: boolean;
    isCreditCardType: boolean;
    showWarnings: boolean;
}

export interface SFSetupObject extends SFInternalConfig {
    fieldType: string;
    cvcRequired: boolean;
    iframeSrc: string;
    loadingContext: string;
    holderEl: HTMLElement;
}

// Config object sent to SecuredField iframe
export interface IframeConfigObject extends SFInternalConfig {
    fieldType: string;
    cvcRequired: boolean;
    numKey: number;
}

interface IframeUIConfigObject {
    sfStyles?: StylesObject;
    placeholders?: PlaceholdersObject;
    ariaConfig?: AriaConfig;
}

export interface PlaceholdersObject {
    [key: string]: string; // e.g. encryptedExpiryDate: 'MM/YY'
}

export type AriaConfig = {
    lang?: string;
} & {
    [key: string]: AriaConfigObject; // e.g. encryptedCardNumber: {...}
};

export interface AriaConfigObject {
    iframeTitle?: string;
    label?: string;
    error?: object;
}

abstract class AbstractSecuredField {
    public config: SFInternalConfig; // could be protected but needs to be public for tests to run
    protected fieldType: string;
    protected iframeSrc: string;
    protected loadingContext: string;
    protected holderEl: HTMLElement;
    // From getters/setters with the same name
    protected _errorType: string;
    protected _hasError: boolean;
    protected _isValid: boolean;
    protected _cvcRequired: boolean;
    protected _iframeContentWindow: Window;
    protected _isEncrypted: boolean;
    protected _numKey: number;
    protected _iframeOnLoadListener: RtnType_noParamVoidFn;
    protected _postMessageListener: RtnType_postMessageListener;
    // Callback fns assigned via public functions
    protected onIframeLoadedCallback: RtnType_noParamVoidFn;
    protected onConfigCallback: RtnType_callbackFn;
    protected onEncryptionCallback: RtnType_callbackFn;
    protected onValidationCallback: RtnType_callbackFn;
    protected onFocusCallback: RtnType_callbackFn;
    protected onBinValueCallback: RtnType_callbackFn;
    protected onClickCallback: RtnType_callbackFn;
    protected onShiftTabCallback: RtnType_callbackFn;
    protected onAutoCompleteCallback: RtnType_callbackFn;

    protected constructor() {
        this.config = ({} as any) as SFInternalConfig;
    }
}

export default AbstractSecuredField;
