import Language from '../../../../../language/Language';
import { BrandStorageObject } from '../types';

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
    sfIsOptionalOrHidden: (f: string) => boolean;
}

/**
 * Base interface for SetupObject & ConfigObject
 */
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
    legacyInputMode?: boolean;
    minimumExpiryDate?: string;
    implementationType?: 'components' | 'custom';
    isCollatingErrors?: boolean;
}

/**
 * Object sent when SecuredFieldsProvider initialises CSF
 */
export interface CSFSetupObject extends CSFCommonProps {
    type: string;
    clientKey: string;
    rootNode: string | HTMLElement;
    callbacks?: object;
    i18n?: Language;
    forceCompat: boolean;
}

/**
 * The type for the config object created by CSF: properties that just need to be set once, at startup, and then don't change
 * This object provides the source for many of the properties that are written into the SFSetupObject used to initialise a new SecuredField.ts
 */
export interface CSFConfigObject extends CSFCommonProps {
    iframeSrc: string;
    isCreditCardType: boolean;
    sfLogAtStart: boolean;
}

export interface CSFCallbacksConfig {
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
    onTouchstartIOS?: (callbackObj: object) => void;
}

export interface CSFStateObject {
    type: string;
    brand: BrandStorageObject;
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
