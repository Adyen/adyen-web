import Language from '../../../../../language/Language';
import { BrandStorageObject, SecuredFields } from '../types';
import { Placeholders } from '../../SFP/types';

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
 * Base interface for CSFSetupObject & CSFConfigObject
 *
 * These are the props that are passed from SFP when CSF is initialised and which end up as props in (CSF) this.config: CSFConfigObject
 */
interface CSFCommonProps {
    autoFocus?: boolean | string;
    keypadFix?: boolean | string;
    // Below are config props that also end up set on createSecuredFields->SecuredFieldSetupObject
    loadingContext: string;
    cardGroupTypes?: string[];
    trimTrailingSeparator?: boolean | string;
    showWarnings?: boolean | string;
    iframeUIConfig?: object;
    legacyInputMode?: boolean;
    minimumExpiryDate?: string;
}

/**
 * The type for the this.config object created by CSF - properties that just need to be calculated & set once, at startup, and then don't change.
 *
 * (CSF) this.config provides the source for many of the properties that are written into the SecuredFieldSetupObject,
 * used by createSecuredFields.ts to initialise a new SecuredField.ts
 *
 * Properties defined directly in *this* interface c.f. CSFCommonProps are ones that are not part of the CSFSetupObject (sent by SecuredFieldProvider)
 * and which are generated/calculated in handleConfig.ts
 */
export interface CSFConfigObject extends CSFCommonProps {
    // These config props also end up set on createSecuredFields->SecuredFieldSetupObject
    iframeSrc: string;
    isCreditCardType: boolean;
    sfLogAtStart: boolean;
}

/**
 * The object sent when SecuredFieldsProvider initialises CSF
 *
 * The properties defined here are ones that will *not* end up on (CSF) this.config
 */
export interface CSFSetupObject extends CSFCommonProps {
    type: string;
    clientKey: string;
    rootNode: string | HTMLElement; // TODO - when is this a string?
    callbacks?: object;
    isKCP?: boolean;
    i18n?: Language;
    implementationType?: 'components' | 'custom';
    forceCompat: boolean;
    placeholders?: Placeholders;
    showContextualElement: boolean;
    maskSecurityCode: boolean;
    exposeExpiryDate: boolean;
    shouldDisableIOSArrowKeys: boolean;
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
    securedFields: SecuredFields;
    isKCP: boolean;
}

export interface CSFThisObject {
    csfState?: CSFStateObject;
    csfConfig?: CSFConfigObject;
    csfProps?: CSFSetupObject;
    csfCallbacks?: CSFCallbacksConfig;
}
