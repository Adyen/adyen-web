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
    CbObjOnBinLookup,
    StylesObject
} from '../internal/SecuredFields/lib/types';
import { CVCPolicyType, DatePolicyType } from '../internal/SecuredFields/lib/types';
import { ClickToPayConfiguration } from '../internal/ClickToPay/types';
import { InstallmentOptions } from './components/CardInput/components/types';
import { DisclaimerMsgObject } from '../internal/DisclaimerMessage/DisclaimerMessage';

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
     * Disable Click to Pay for testing purposes
     * @defaultValue false
     * @internal
     */
    _disableClickToPay?: boolean;

    /**
     * Funding source field populated when 'splitCardFundingSources' is used
     * @internal
     */
    fundingSource?: 'debit' | 'credit';

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
     * Position holder name above card number field (instead of having it after the security code field)
     * @defaultValue `false`
     */
    positionHolderNameOnTop?: boolean;

    /**
     * Show/hide the brand logo when the card brand has been recognized
     * @defaultValue `true`
     */
    showBrandIcon?: boolean;

    /**
     * Show/hide the sentence 'All fields are required unless marked otherwise.' on the top of the form
     * @defaultValue `true`
     */
    showFormInstruction?: boolean;

    /** Show/hide the "store details" checkbox */
    enableStoreDetails?: boolean;

    /** Show/hide the Security Code field - merchant set config option */
    hideCVC?: boolean;

    /**
     *  Decides whether the CVC (Security Code) component will even be rendered.
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
     * Defines the size of the challenge Component
     *
     * 01: [250px, 400px]
     * 02: [390px, 400px]
     * 03: [500px, 600px]
     * 04: [600px, 400px]
     * 05: [100%, 100%]
     *
     * @defaultValue '02'
     */
    challengeWindowSize?: '01' | '02' | '03' | '04' | '05';

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
     * Called in case of an invalid Card Number, invalid Expiry Date, or incomplete field. Called again when errors are cleared.
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

    /**
     * Related to storedCards - this information comes from the storedCardData once we process it
     * @internal
     */
    storedPaymentMethodId?: string;
    lastFour?: string;

    /**
     * Mostly used in relation to KCP cards
     */
    countryCode?: string;

    /**
     * Show Address fields
     * @defaultValue `false`
     */
    billingAddressRequired?: boolean;

    /**
     * Config to specify which address field are required | limit the countries that will show in the country dropdown
     */
    billingAddressRequiredFields?: string[];
    billingAddressAllowedCountries?: string[];

    /**
     * Configure the installment options for the card
     */
    installmentOptions?: InstallmentOptions;

    /**
     * Set whether to show installments broken down into amounts or months
     * @defaultValue `true`
     */
    showInstallmentAmounts?: boolean;

    /**
     * For some scenarios make the card input fields (PAN, Expiry Date, Security Code) have type="tel" rather than type="text" inputmode="numeric"
     * @defaultValue `false`
     */
    legacyInputMode?: boolean;

    /**
     * Specify the minimum expiry date that will be considered valid
     */
    minimumExpiryDate?: string[];

    /**
     * Automatically shift the focus from one field to another. Usually happens from a valid Expiry Date field to the Security Code field,
     * but some BINS also allow us to know that the PAN is complete, in which case we can shift focus to the date field
     * @defaultValue `true`
     */
    autoFocus?: boolean;

    /**
     * Adds type="password" to the Security code input field, causing its value to be masked
     * @defaultValue `false`
     */
    maskSecurityCode?: boolean;

    /**
     * Allow binLookup process to occur
     * @defaultValue `true`
     */
    doBinLookup?: boolean;

    /**
     * Turn on the procedure to force the arrow keys on an iOS soft keyboard to always be disabled
     * @defaultValue `false`
     */
    disableIOSArrowKeys?: boolean;

    /**
     * Object to configure the message and text for a disclaimer message, added after the Card input fields
     */
    disclaimerMessage?: DisclaimerMsgObject;

    /**
     * Object to configure the styling of the inputs in the iframes that are used to present the PAN, Expiry Date & Security Code fields
     */
    styles?: StylesObject;

    /**
     * Implements a workaround for iOS/Safari bug where keypad doesn't retract when SF paymentMethod is no longer active
     * @defaultValue `true`
     */
    keypadFix?: boolean; // Keep, but use analytics to record if anyone *ever* uses this config prop

    // placeholders: Placeholders; // TODO align with v6 Bento branch

    // forceCompat?: boolean, // TODO - probably drop, if Checkout won't support IE then SF doesn't need to
    // allowedDOMAccess: false, // TODO -  Drop for v6 (not sure if anyone ever uses this)
}

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
    name?: string;
    icon?: string;
}

export interface CardBrandsConfiguration {
    [key: string]: BrandConfiguration;
}

interface CardPaymentMethodData {
    type: string;
    brand?: string;
    storedPaymentMethodId?: string;
    fundingSource?: 'debit' | 'credit';
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
    paymentMethodVariant?: string;
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
