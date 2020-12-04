import Language from '../../../../language/Language';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
    interface Window {
        _b$dl: boolean;
    }
}

/**
 * Exposed functions that can be called on the CSF instance
 */
export interface CSFReturnObject {
    updateStyles: any;
    setFocusOnFrame: any;
    isValidated: any;
    destroy: any;
    brandsFromBinLookup: any;
    hasUnsupportedCard: any;
    addSecuredField: any;
    removeSecuredField: any;
    setKCPStatus: any;
    sendValueToFrame?: any;
}

interface CSFCommonProps {
    loadingContext: string;
    cardGroupTypes?: string[];
    allowedDOMAccess?: boolean;
    autoFocus?: boolean;
    trimTrailingSeparator?: boolean;
    showWarnings?: boolean;
    keypadFix?: boolean;
    isKCP?: boolean;
    iframeUIConfig?: object;
}

export interface SetupObject extends CSFCommonProps {
    type: string;
    originKey: string;
    clientKey: string;
    rootNode: string | HTMLElement;
    callbacks?: object;
    i18n?: Language;
}

export interface ConfigObject extends CSFCommonProps {
    iframeSrc: string;
    isCreditCardType: boolean;
    sfLogAtStart: boolean;
}

export interface CallbacksConfig {
    onLoad?: (callbackObj: object) => void;
    onConfigSuccess?: (callbackObj: object) => void;
    onFieldValid?: (callbackObj: object) => void;
    onAllValid?: (callbackObj: object) => void;
    onBrand?: (callbackObj: object) => void;
    onError?: (callbackObj: object) => void;
    onFocus?: (callbackObj: object) => void;
    onBinValue?: (callbackObj: object) => void;
    onAutoComplete?: (callbackObj: object) => void;
    onAdditionalSFConfig?: (callbackObj: object) => void;
    onAdditionalSFRemoved?: (callbackObj: object) => void;
}

export interface CSFStateObject {
    type: string;
    brand: string;
    allValid: boolean;
    numIframes: number;
    originalNumIframes: number;
    iframeCount: number;
    iframeConfigCount: number;
    isConfigured: boolean;
    hasSeparateDateFields: boolean;
    currentFocusObject: string;
    registerFieldForIos: boolean;
    securedFields: object;
    isKCP: boolean;
}

export interface StylesObject {
    base?: StyleDefinitions;
    error?: StyleDefinitions;
    validated?: StyleDefinitions;
    placeholder?: StyleDefinitions;
}

interface StyleDefinitions {
    background?: string;
    caretColor?: string;
    color?: string;
    display?: string;
    font?: string;
    fontFamily?: string;
    fontSize?: string;
    fontSizeAdjust?: string;
    fontSmoothing?: string;
    fontStretch?: string;
    fontStyle?: string;
    fontVariant?: string;
    fontVariantAlternates?: string;
    fontVariantCaps?: string;
    fontVariantEastAsian?: string;
    fontVariantLigatures?: string;
    fontVariantNumeric?: string;
    fontWeight?: string;
    letterSpacing?: string;
    lineHeight?: string;
    mozOsxFontSmoothing?: string;
    mozTransition?: string;
    outline?: string;
    opacity?: string;
    padding?: string;
    textAlign?: string;
    textShadow?: string;
    transition?: string;
    webkitFontSmoothing?: string;
    webkitTransition?: string;
    wordSpacing?: string;
}

export interface CardObject {
    cardType: string;
    startingRules: number[];
    permittedLengths: number[];
    pattern: RegExp;
    securityCode?: string;
    displayName?: string;
    cvcRequired?: boolean;
    hideCVC?: boolean;
}

export interface CbObjOnBrand {
    type: string;
    rootNode: HTMLElement;
    brand: string;
    hideCVC: boolean;
    cvcRequired: boolean;
    cvcText: string;
    brandImageUrl?: string; // Added by SFP
    // maxLength: number;
}

export interface CbObjOnAllValid {
    type: string;
    allValid: boolean;
    rootNode: HTMLElement;
}

export interface CbObjOnFieldValid {
    fieldType: string;
    encryptedFieldName: string;
    uid: string;
    valid: boolean;
    type: string;
    rootNode: HTMLElement;
    blob?: string;
    endDigits?: string;
}

export interface CbObjOnAutoComplete {
    fieldType: string;
    name: string;
    value: string;
    action: string;
}

export interface CbObjOnBinValue {
    type: string;
    binValue: string;
    uuid?: string;
    encryptedBin?: string;
}

export interface CbObjOnError {
    fieldType: string;
    error: string;
    type: string;
    rootNode?: HTMLElement;
    binLookupBrands?: string[];
    errorI18n?: string;
    errorText?: string;
}

export interface CbObjOnFocus {
    action: string;
    focus: boolean;
    numChars: number;
    fieldType: string;
    rootNode: HTMLElement;
    type: string;
    currentFocusObject: string;
}

export interface CbObjOnLoad {
    iframesLoaded: boolean;
}

export interface CbObjOnConfigSuccess {
    iframesConfigured: boolean;
    type: string;
}

export interface CbObjOnAdditionalSF {
    additionalIframeConfigured?: boolean;
    additionalIframeRemoved?: boolean;
    fieldType: string;
    type: string;
}

export interface SFFeedbackObj {
    action: string;
    fieldType: string;
    numKey: number;
    brand?: string;
    hideCVC?: boolean;
    code?: string;
    cvcText?: string;
    cvcRequired?: boolean;
    maxLength?: number;
    error?: string;
    endDigits?: string;
    type?: string;
    binValue?: string;
    focus?: boolean;
    numChars?: number;
    rootNode?: HTMLElement;
    currentFocusObject?: string;
    name?: string;
    value?: string;
    encryptedBin?: string;
    uuid?: string;
    encryptionSuccess?: boolean;
    // [key: string]: EncryptionObj[]; // Doesn't work, so must use an intersection type (https://github.com/Microsoft/TypeScript/issues/20597)
    // BUT this doesn't give as much feedback as an interface e.g. about missing properties
    // } & {
    //     [key: string]: EncryptionObj[];// To describe - { MY_DATA-CSE_VALUE: [EncryptionObj] } e.g. { encryptedCardNumber: [{type: '...', fieldName: '...', blob: '...'}] }
}

export interface EncryptionObj {
    type: string;
    encryptedFieldName: string;
    blob: string;
}

export interface ShiftTabObject {
    fieldToFocus: string;
    additionalField: HTMLElement;
}

export interface BinLookupObject {
    issuingCountryCode: string;
    requestId: string;
    supportedBrands?: string[];
}
