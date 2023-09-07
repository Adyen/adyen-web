import { CVCPolicyType, DatePolicyType, RtnType_callbackFn, RtnType_noParamVoidFn, RtnType_postMessageListener, StylesObject } from '../types';
import {
    ENCRYPTED_BANK_ACCNT_NUMBER_FIELD,
    ENCRYPTED_BANK_LOCATION_FIELD,
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR,
    ENCRYPTED_PWD_FIELD,
    ENCRYPTED_SECURITY_CODE,
    ENCRYPTED_SECURITY_CODE_3_DIGITS,
    ENCRYPTED_SECURITY_CODE_4_DIGITS
} from '../configuration/constants';
import { Placeholders } from '../../SFP/types';

/**
 * Base interface, props common to both SecuredFieldInitObj & IframeConfigObject
 *
 * These are the props that are passed from CSF.createSecuredFields when SecuredField.ts is initialised
 * but which also end up as props in the IframeConfigObject
 */
export interface SFInternalConfig {
    // originally extracted in createSecuredFields
    fieldType: string;
    extraFieldData: string;
    uid: string;
    // originally calculated in createSecuredFields, for single branded cards, based on initial assessment of brand info; else defaults to true
    cvcPolicy: CVCPolicyType;
    // originally set in createSecuredFields
    expiryDatePolicy: DatePolicyType;
    // originally read from CSF->this.state
    txVariant: string;
    // originally from CSF->this.config
    cardGroupTypes: string[];
    iframeUIConfig: IframeUIConfigObject;
    sfLogAtStart: boolean;
    trimTrailingSeparator: boolean;
    isCreditCardType: boolean;
    showWarnings: boolean;
    legacyInputMode: boolean;
    minimumExpiryDate: string;
    implementationType: string;
    maskSecurityCode: boolean;
    disableIOSArrowKeys: boolean;
}

/**
 * The object sent when createSecuredFields initialises a new instance of SecuredField.ts
 *
 * Properties defined directly in *this* interface c.f. SFInternalConfig are ones
 * that are needed by SecuredField.ts but are *not* required in the IframeConfigObject
 */
export interface SecuredFieldInitObj extends SFInternalConfig {
    iframeSrc: string;
    loadingContext: string;
    holderEl: HTMLElement;
    showContextualElement: boolean;
    placeholders: Placeholders;
}

/**
 * Object sent via postMessage to a SecuredField iframe in order to configure that iframe
 *
 * Properties defined directly in *this* interface are ones that are calculated by SecuredField.ts
 * instead of just being read directly from the SecuredFieldInitObj
 */
export interface IframeConfigObject extends SFInternalConfig {
    numKey: number;
}

interface IframeUIConfigObject {
    sfStyles?: StylesObject;
    placeholders?: SFPlaceholdersObject;
    ariaConfig?: AriaConfig;
}

export interface SFPlaceholdersObject {
    [ENCRYPTED_CARD_NUMBER]?: string;
    [ENCRYPTED_EXPIRY_DATE]?: string;
    [ENCRYPTED_EXPIRY_MONTH]?: string;
    [ENCRYPTED_EXPIRY_YEAR]?: string;
    [ENCRYPTED_SECURITY_CODE]?: string;
    [ENCRYPTED_SECURITY_CODE_3_DIGITS]?: string;
    [ENCRYPTED_SECURITY_CODE_4_DIGITS]?: string;
    [ENCRYPTED_PWD_FIELD]?: string;
    [ENCRYPTED_BANK_ACCNT_NUMBER_FIELD]?: string;
    [ENCRYPTED_BANK_LOCATION_FIELD]?: string;
}

interface ContextualTexts {
    [ENCRYPTED_EXPIRY_DATE]?: string;
    [ENCRYPTED_SECURITY_CODE_3_DIGITS]?: string;
    [ENCRYPTED_SECURITY_CODE_4_DIGITS]?: string;
    [ENCRYPTED_BANK_ACCNT_NUMBER_FIELD]?: string;
}

export type AriaConfig = {
    lang?: string;
} & {
    [key: string]: AriaConfigObject; // e.g. encryptedCardNumber: {...}
};

export interface AriaConfigObject {
    iframeTitle?: string;
    label?: string;
    contextualTexts?: ContextualTexts;
}

abstract class AbstractSecuredField {
    public sfConfig: SFInternalConfig; // could be protected but needs to be public for tests to run
    public fieldType: string;
    protected loadingContext: string;
    protected holderEl: HTMLElement;
    protected iframeRef: HTMLElement;
    public loadToConfigTimeout: number;
    // From getters/setters with the same name
    protected _errorType: string;
    protected _hasError: boolean;
    protected _isValid: boolean;
    protected _cvcPolicy: CVCPolicyType;
    protected _expiryDatePolicy: DatePolicyType;
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
    protected onTouchstartCallback: RtnType_callbackFn;
    protected onShiftTabCallback: RtnType_callbackFn;
    protected onAutoCompleteCallback: RtnType_callbackFn;

    protected constructor() {
        this.sfConfig = {} as any as SFInternalConfig;
    }
}

export default AbstractSecuredField;
