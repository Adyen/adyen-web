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

/**
 * Base interface, props common to both SFSetupObject & IframeConfigObject
 */
export interface SFInternalConfig {
    fieldType: string; // extracted in createSecuredFields
    extraFieldData: string; // extracted in createSecuredFields
    txVariant: string;
    cardGroupTypes: string[];
    iframeUIConfig: IframeUIConfigObject;
    sfLogAtStart: boolean;
    trimTrailingSeparator: boolean;
    isCreditCardType: boolean;
    showWarnings: boolean;
    cvcPolicy: CVCPolicyType;
    expiryDatePolicy: DatePolicyType;
    legacyInputMode: boolean;
    minimumExpiryDate: string;
    uid: string;
    implementationType: string;
    bundleType: string;
    isCollatingErrors: boolean;
}

/**
 * The object passed from createSecuredFields to a new instance of SecuredField.ts
 */
export interface SFSetupObject extends SFInternalConfig {
    expiryDatePolicy: DatePolicyType;
    iframeSrc: string;
    loadingContext: string;
    holderEl: HTMLElement;
}

/**
 * Object sent via postMessage to a SecuredField iframe
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
    protected onClickCallback: RtnType_callbackFn;
    protected onShiftTabCallback: RtnType_callbackFn;
    protected onAutoCompleteCallback: RtnType_callbackFn;

    protected constructor() {
        this.config = ({} as any) as SFInternalConfig;
    }
}

export default AbstractSecuredField;
