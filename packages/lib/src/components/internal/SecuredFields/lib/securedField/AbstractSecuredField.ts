import {
    CVCPolicyType,
    DatePolicyType,
    RtnType_callbackFn,
    RtnType_noParamVoidFn,
    RtnType_postMessageListener,
    SecuredFieldCommonProps
} from '../types';

abstract class AbstractSecuredField {
    public sfConfig: SecuredFieldCommonProps; // could be protected but needs to be public for tests to run
    protected loadingContext: string;
    protected holderEl: HTMLElement;
    protected iframeRef: HTMLElement;
    public loadToConfigTimeout: number;
    // From getters/setters with the same name
    protected _isValid: boolean;
    protected _iframeContentWindow: Window;
    protected _numKey: number;
    protected _isEncrypted: boolean;
    protected _hasError: boolean;
    protected _errorType: string;
    protected _cvcPolicy: CVCPolicyType;
    protected _expiryDatePolicy: DatePolicyType;
    protected _iframeOnLoadListener: RtnType_noParamVoidFn;
    protected _postMessageListener: RtnType_postMessageListener;
    // Callback fns assigned via public functions
    protected onIframeLoadedCallback: RtnType_noParamVoidFn;
    protected onConfigCallback: RtnType_callbackFn;
    protected onEncryptionCallback: RtnType_callbackFn;
    protected onValidationCallback: RtnType_callbackFn;
    protected onFocusCallback: RtnType_callbackFn;
    protected onBinValueCallback: RtnType_callbackFn;
    protected onTouchstartCallback: RtnType_callbackFn;
    protected onShiftTabCallback: RtnType_callbackFn;
    protected onAutoCompleteCallback: RtnType_callbackFn;

    protected constructor() {
        this.sfConfig = {} as any as SecuredFieldCommonProps;
    }
}

export default AbstractSecuredField;
