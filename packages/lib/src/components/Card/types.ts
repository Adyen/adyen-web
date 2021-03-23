import { UIElementProps } from '../UIElement';
import { AddressSchema, BrowserInfo } from '../../types';
import {
    CbObjOnBinValue,
    CbObjOnBrand,
    CbObjOnConfigSuccess,
    CbObjOnError,
    CbObjOnFieldValid,
    CbObjOnFocus,
    CbObjOnLoad,
    CbObjOnBinLookup
} from '../internal/SecuredFields/lib/types';
import { CVCPolicyType } from '../internal/SecuredFields/lib/core/AbstractSecuredField';

export interface CardElementProps extends UIElementProps {
    /**
     * Only set for a single-branded card or a stored card,
     * brand is never set for a generic card component
     */
    brand?: string;

    /**
     * type will always be "card" (generic card, stored card)
     * except for a single branded card when it will be the same as the brand prop
     */
    type?: string;

    /** @deprecated use brands instead */
    groupTypes?: string[];

    /** List of brands accepted by the component */
    brands?: string[];

    /** Show/hide the "store details" checkbox */
    enableStoreDetails?: boolean;

    /** Show/hide the CVC field - merchant set config option */
    hideCVC?: boolean;

    /**
     *  Decides whether CVC component will even be rendered.
     *  Always true except when hideCVC set to false by merchant OR in the case of a *stored* BCMC card.
     *  (For the Bancontact card comp this is set to true since dual-branding possibilities mean the BCMC card can now end up needing to show a CVC field)
     */
    hasCVC?: boolean;

    /** Show/hide the card holder name field */
    hasHolderName?: boolean;

    /** Whether the card holder name field will be required */
    holderNameRequired?: boolean;

    configuration?: CardConfiguration;

    /**
     * Called once all the card input fields have been created but are not yet ready to use.
     */
    onLoad?: (event: CbObjOnLoad) => void;

    /**
     * Called once the card input fields are ready to use.
     */
    onConfigSuccess?: (event: CbObjOnConfigSuccess) => void;

    /**
     * Called when a field becomes valid and also if a valid field changes and becomes invalid.
     * For the card number field, it returns the last 4 digits of the card number.
     */
    onFieldValid?: (event: CbObjOnFieldValid) => void;

    /**
     * Called once we detect the card brand.
     */
    onBrand?: (event: CbObjOnBrand) => void;

    /**
     * Called in case of an invalid card number, invalid expiry date, or incomplete field. Called again when errors are cleared.
     */
    onError?: (event: CbObjOnError) => void;

    /**
     * Called when a field gains or loses focus.
     */
    onFocus?: (event: CbObjOnFocus) => void;

    /**
     * Provides the BIN Number of the card (up to 6 digits), called as the user types in the PAN.
     */
    onBinValue?: (event: CbObjOnBinValue) => void;

    /**
     * After binLookup call - provides the brand(s) we detect the user is entering, and if we support the brand(s)
     */
    onBinLookup?: (event: CbObjOnBinLookup) => void;

    [key: string]: any;
}

export interface CardConfiguration {
    koreanAuthenticationRequired?: boolean;
}

interface CardPaymentMethodData {
    type: string;
    brand?: string;
    storedPaymentMethodId?: string;
    fundingSource?: string;
    holderName?: string;
    encryptedCardNumber?: string;
    encryptedExpiryMonth?: string;
    encryptedExpiryYear?: string;
    encryptedSecurityCode?: string;
}

export interface CardElementData {
    paymentMethod: CardPaymentMethodData;
    billingAddress?: AddressSchema;
    installments?: { value: number };
    storePaymentMethod?: boolean;
    browserInfo: BrowserInfo;
}

export interface BrandObject {
    brand: string;
    cvcPolicy: CVCPolicyType;
    enableLuhnCheck: boolean;
    showExpiryDate: boolean;
    supported: boolean;
}

export interface BinLookupResponseRaw {
    requestId: string;
    issuingCountryCode?: string;
    brands?: BrandObject[];
    // OR, if an error has occurred
    status: number;
    errorCode: string;
    message: string;
    errorType: string;
}

/**
 * Mapped & simplified version of BinLookupResponseRaw
 */
export interface BinLookupResponse {
    issuingCountryCode: string;
    showSocialSecurityNumber?: boolean;
    supportedBrands?: BrandObject[];
}

export interface DualBrandSelectElement {
    id: string;
    brandObject: BrandObject;
}
