import Language from '../../../../../language/Language';
import { BrandStorageObject } from '../types';
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
 * These are the props that are passed from SFP when CSF is initialised but which also end up
 * as props in CSF->this.config: CSFConfigObject
 *
 * (this.config mostly contains props that are used to instantiate a new SecuredField.ts, via createSecuredFields.ts)
 */
interface CSFCommonProps {
    allowedDOMAccess?: boolean | string; // accept boolean or string representation of a boolean i.e. "false"
    autoFocus?: boolean | string;
    keypadFix?: boolean | string;
    // Below are config props that also end up set on createSecuredFields->SecuredFieldInitObj
    loadingContext: string;
    cardGroupTypes?: string[];
    trimTrailingSeparator?: boolean | string;
    showWarnings?: boolean | string;
    iframeUIConfig?: object;
    legacyInputMode?: boolean;
    minimumExpiryDate?: string;
}

/**
 * The object sent when SecuredFieldsProvider initialises CSF
 *
 * The properties defined here are ones that will not end up on CSF->this.config
 */
export interface CSFSetupObject extends CSFCommonProps {
    type: string;
    clientKey: string;
    rootNode: string | HTMLElement;
    callbacks?: object;
    isKCP?: boolean;
    i18n?: Language;
    implementationType?: 'components' | 'custom';
    forceCompat: boolean;
    placeholders?: Placeholders;
    showContextualElement: boolean;
    maskSecurityCode: boolean;
    shouldDisableIOSArrowKeys: boolean;
}

/**
 * The type for the this.config object created by CSF - properties that just need to be set once, at startup, and then don't change.
 *
 * The CSFConfigObject provides the source for many of the properties that are written into the
 * SecuredFieldInitObj used by createSecuredFields.ts to initialise a new SecuredField.ts
 *
 * Properties defined directly in *this* interface c.f. CSFCommonProps are ones that are not part of the CSFSetupObject (sent by SecuredFieldProvider)
 * and which are generated/calculated in handleConfig.ts
 */
export interface CSFConfigObject extends CSFCommonProps {
    // These config props also end up set on createSecuredFields->SecuredFieldInitObj
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
