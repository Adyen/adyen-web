import { UIElementProps } from '../types';
import { AddressData, BrowserInfo } from '../../types';
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
import { CVCPolicyType, DatePolicyType } from '../internal/SecuredFields/lib/types';
import { IdentityLookupParams } from './components/ClickToPay/services/types';
import { SrcInitParams } from './components/ClickToPay/services/sdks/types';

export interface CardElementProps extends UIElementProps {
    /**
     * Only set for a stored card,
     * brand is never set for a generic card component OR a single-branded card
     */
    brand?: string;

    /**
     * Configuration specific to brands
     */
    brandsConfiguration?: CardBrandsConfiguration;

    /**
     * Configuration for Click to Pay
     */
    clickToPayConfiguration?: ClickToPayConfiguration;

    /**
     * type will always be "card" (generic card, stored card)
     * except for a single branded card when it will be the same as the brand prop
     */
    type?: string;

    /** List of brands accepted by the component */
    brands?: string[];

    /**
     * Show/hide available card brands under the Card number field
     * @defaultValue `false`
     */
    showBrandsUnderCardNumber?: boolean;

    /**
     * Show/hide the brand logo when the card brand has been recognized
     * @defaultValue `true`
     */
    showBrandIcon?: boolean;

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

    /** An object sent in the /paymentMethods response */
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

export type ClickToPayScheme = 'mc' | 'visa';

export type ClickToPayConfiguration = {
    shopperIdentityValue: string;
    shopperIdentityType?: 'email' | 'mobilePhone';
    /**
     * Used to ensure the correct language and user experience if DCF screen is displayed. As a fallback, it uses the main locale
     * defined during the creation of the Checkout.
     * Format: ISO language_country pair (e.g., en_US )
     *
     * @default en_US
     */
    locale?: string;
};

export type SocialSecurityMode = 'show' | 'hide' | 'auto';

// TODO clarify exact properties that can be in this object
//  - should only be ones that can be sent in the configuration object in the /paymentMethods response
/** If the merchant wishes to set any of these properties in their local config they should do so via a "configuration" object */
export interface CardConfiguration {
    // Click to Pay
    visaSrciDpaId?: string;
    visaSrcInitiatorId?: string;
    mcSrcClientId?: string;
    mcDpaId?: string;

    // GooglePay
    merchantIdentifier?: string;
    merchantOrigin?: string;
    gatewayMerchantId?: string;

    // AmazonPay
    publicKeyId?: string;
    region?: string;

    // Common to GooglePay & ApplePay
    merchantName?: string;

    // Common to GooglePay & AmazonPay
    merchantId?: string;

    // Paypal
    intent?: string;

    // KCP
    koreanAuthenticationRequired?: boolean;

    // Card?
    socialSecurityNumberMode?: SocialSecurityMode;

    // Remove?
    icon?: string;
    brandsConfiguration?: CardBrandsConfiguration;
}

export interface BrandConfiguration {
    name: string;
    icon?: string;
}

export interface CardBrandsConfiguration {
    [key: string]: BrandConfiguration;
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
    billingAddress?: AddressData;
    installments?: { value: number };
    storePaymentMethod?: boolean;
    browserInfo: BrowserInfo;
    origin?: string;
}

export interface BrandObject {
    brand: string;
    cvcPolicy: CVCPolicyType;
    enableLuhnCheck: boolean;
    showExpiryDate?: boolean;
    expiryDatePolicy?: DatePolicyType;
    showSocialSecurityNumber?: boolean;
    supported: boolean;
    brandImageUrl?: string;
    panLength?: number;
}

export interface BinLookupResponseRaw {
    requestId: string;
    issuingCountryCode?: string;
    brands?: BrandObject[];
    showSocialSecurityNumber?: boolean;

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
