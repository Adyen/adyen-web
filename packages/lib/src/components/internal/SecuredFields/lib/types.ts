import { BrandObject } from '../../../Card/types';
import SecuredField from './securedField/SecuredField';
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
    ENCRYPTED_SECURITY_CODE_4_DIGITS,
    HIDDEN,
    OPTIONAL,
    REQUIRED
} from './constants';
import { SF_ErrorCodes } from '../../../../core/Errors/constants';
import { Placeholders } from '../SFP/types';

declare global {
    interface Window {
        _b$dl: boolean;
        mockBinCount: number;
    }
}

export type SFFieldType =
    | 'encryptedCardNumber'
    | 'encryptedExpiryDate'
    | 'encryptedExpiryMonth'
    | 'encryptedExpiryYear'
    | 'encryptedSecurityCode'
    | 'encryptedPassword'
    | 'encryptedBankAccountNumber'
    | 'encryptedBankLocationId';

export interface SecuredFields {
    encryptedCardNumber?: SecuredField;
    encryptedExpiryDate?: SecuredField;
    encryptedExpiryMonth?: SecuredField;
    encryptedExpiryYear?: SecuredField;
    encryptedSecurityCode?: SecuredField;
    encryptedPassword?: SecuredField;
    encryptedBankAccountNumber?: SecuredField;
    encryptedBankLocationId?: SecuredField;
}

export interface BrandStorageObject {
    brand: string;
    cvcPolicy: CVCPolicyType;
    expiryDatePolicy: DatePolicyType;
    showSocialSecurityNumber?: boolean;
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
    startingRules?: number[];
    permittedLengths?: number[];
    pattern?: RegExp;
    securityCode?: string;
    displayName?: string;
    cvcPolicy?: CVCPolicyType;
    expiryDatePolicy?: DatePolicyType;
}

export interface CbObjOnBrand {
    type: string;
    rootNode: HTMLElement;
    brand: string;
    cvcPolicy: CVCPolicyType;
    expiryDatePolicy?: DatePolicyType;
    cvcText: string;
    showSocialSecurityNumber?: boolean;
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
    expiryDate?: string;
    issuerBin?: number;
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

export interface CbObjOnBinLookup {
    type?: string;
    detectedBrands?: string[];
    supportedBrands?: string[];
    brands?: string[];
    issuingCountryCode?: string;
    // New for CustomCard
    supportedBrandsRaw?: BrandObject[];
    rootNode?: HTMLElement;
    isReset?: boolean; // Used internally - not propagated to merchant callback
}

export interface CbObjOnError {
    fieldType: string;
    error: string;
    type: string;
    rootNode?: HTMLElement;
    detectedBrands?: string[];
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
    rootNode: HTMLElement;
}

export interface CbObjOnAdditionalSF {
    additionalIframeConfigured?: boolean;
    additionalIframeRemoved?: boolean;
    fieldType: string;
    type: string;
}

export interface SFFeedbackObj {
    action: string;
    fieldType: SFFieldType;
    numKey: number;
    brand?: string;
    code?: string;
    cvcText?: string;
    cvcPolicy?: CVCPolicyType;
    expiryDatePolicy?: DatePolicyType;
    showSocialSecurityNumber?: boolean;
    maxLength?: number;
    error?: string;
    endDigits?: string;
    issuerBin?: string;
    expiryDate?: string;
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
    hasGenuineTouchEvents?: boolean;
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

export interface SendBrandObject {
    brand: string;
    enableLuhnCheck: boolean;
    panLength?: number;
}

export interface SendExpiryDateObject {
    expiryDatePolicy: DatePolicyType;
}

export type RtnType_noParamVoidFn = () => void;
export type RtnType_postMessageListener = (event: Event) => void;
export type RtnType_callbackFn = (feedbackObj: SFFeedbackObj) => void;

export type CVCPolicyType = typeof REQUIRED | typeof OPTIONAL | typeof HIDDEN;
export type DatePolicyType = typeof REQUIRED | typeof OPTIONAL | typeof HIDDEN;

interface IframeUIConfigObject {
    sfStyles?: StylesObject;
    placeholders?: SFPlaceholdersObject;
    ariaConfig?: AriaConfig;
}

/**
 * Object sent via postMessage to a SecuredField iframe in order to configure that iframe
 *
 * Properties defined directly in *this* interface are ones that are calculated by SecuredField.ts
 * instead of just being read directly from the SecuredFieldSetupObject
 */
export interface IframeConfigObject extends SecuredFieldCommonProps {
    numKey: number;
}

/**
 * Base interface for SecuredFieldSetupObject & IframeConfigObject
 *
 * These are the props that are passed from CSF.createSecuredFields when SecuredField.ts is initialised
 * but which also end up as props in the IframeConfigObject
 */
export interface SecuredFieldCommonProps {
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
    // originally from CSF->this.props
    implementationType: string;
    maskSecurityCode: boolean;
    exposeExpiryDate: boolean;
    disableIOSArrowKeys: boolean;
}

/**
 * The object sent when createSecuredFields initialises a new instance of SecuredField.ts
 *
 * Properties defined directly in *this* interface c.f. SecuredFieldCommonProps are ones
 * that are needed by SecuredField.ts but are *not* required in the IframeConfigObject
 */
export interface SecuredFieldSetupObject extends SecuredFieldCommonProps {
    loadingContext: string;
    holderEl: HTMLElement;
    iframeSrc: string;
    showContextualElement?: boolean;
    placeholders: Placeholders;
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
    error?: Record<SF_ErrorCodes, string>;
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

export interface SFKeyPressObj {
    fieldType: string;
    action: string;
}
