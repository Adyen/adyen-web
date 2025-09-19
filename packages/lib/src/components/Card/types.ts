import { ComponentFocusObject, AddressData, BrowserInfo } from '../../types/global-types';
import {
    CardBinValueData,
    CardBrandData,
    CardConfigSuccessData,
    CardFieldValidData,
    CardFocusData,
    CardLoadData,
    CardBinLookupData,
    StylesObject
} from '../internal/SecuredFields/lib/types';
import { CVCPolicyType, DatePolicyType, CardAllValidData } from '../internal/SecuredFields/lib/types';
import { ClickToPayProps } from '../internal/ClickToPay/types';
import { InstallmentOptions } from './components/CardInput/components/types';
import { DisclaimerMsgObject } from '../internal/DisclaimerMessage/DisclaimerMessage';
import { UIElementProps } from '../internal/UIElement/types';
import type { OnAddressLookupType, OnAddressSelectedType } from '../internal/Address/components/AddressSearch';
import type { FastlaneSignupConfiguration } from '../PayPalFastlane/types';

type PlaceholderKeys =
    | 'holderName'
    | 'cardNumber'
    | 'expiryDate'
    | 'expiryMonth'
    | 'expiryYear'
    | 'securityCodeThreeDigits'
    | 'securityCodeFourDigits'
    | 'password';

export type CardPlaceholders = Partial<Record<PlaceholderKeys, string>>;

export interface CardConfiguration extends UIElementProps {
    /**
     * Automatically shift the focus from one field to another. Usually happens from a valid Expiry Date field to the Security Code field,
     * but some BINS also allow us to know that the PAN is complete, in which case we can shift focus to the date field
     * @defaultValue `true`
     *
     * - merchant set config option
     */
    autoFocus?: boolean;

    /**
     * Config t olimit the countries that will show in the country dropdown
     * - merchant set config option
     */
    billingAddressAllowedCountries?: string[];

    /**
     * If billingAddressRequired is set to true, you can set this to partial to require the shopper's postal code instead of the full address.
     * @defaultValue full
     *
     * - merchant set config option
     */
    billingAddressMode?: 'full' | 'partial' | 'none';

    /**
     * Show Address fields
     * @defaultValue `false`
     *
     * - merchant set config option
     */
    billingAddressRequired?: boolean;

    /**
     * Config to specify which address field are required
     * - merchant set config option
     */
    billingAddressRequiredFields?: string[];

    /**
     * Only set for a stored card,
     * brand is never set for a generic card component OR a single-branded card
     * @internal
     */
    brand?: string;

    /**
     * List of brands accepted by the component
     * @internal
     * - but can also be overwritten by merchant config option
     */
    brands?: string[];

    /**
     * Configuration specific to brands
     * - merchant set config option
     */
    brandsConfiguration?: CardBrandsConfiguration;

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
     *
     * - merchant set config option
     */
    challengeWindowSize?: '01' | '02' | '03' | '04' | '05';

    /**
     * Configuration for Click to Pay
     * - merchant set config option
     */
    clickToPayConfiguration?: ClickToPayProps;

    /**
     * Configuration for displaying the Fastlane consent UI.
     */
    fastlaneConfiguration?: FastlaneSignupConfiguration;

    /**
     * An object sent in the /paymentMethods response
     * @internal
     */
    configuration?: CardBackendConfiguration;

    /**
     * Mostly used in relation to KCP cards
     * @internal
     */
    countryCode?: string;

    /**
     * Object that contains placeholder information that you can use to prefill fields.
     * - merchant set config option
     */
    data?: {
        holderName?: string;
        billingAddress?: Partial<AddressData>;
    };

    /**
     * Disable Click to Pay for testing purposes
     * @defaultValue false
     * @internal
     */
    _disableClickToPay?: boolean;

    /**
     * Turn on the procedure to force the arrow keys on an iOS soft keyboard to always be disabled
     * @defaultValue `false`
     *
     * - merchant set config option
     */
    disableIOSArrowKeys?: boolean;

    /**
     * Object to configure the message and text for a disclaimer message, added after the Card input fields
     * - merchant set config option
     */
    disclaimerMessage?: DisclaimerMsgObject;

    /**
     * Allow binLookup process to occur
     * @defaultValue `true`
     *
     * - merchant set config option
     */
    doBinLookup?: boolean;

    /**
     * Config option related to whether we set storePaymentMethod in the card data, and showing/hiding the "store details" checkbox
     * - merchant set config option
     */
    enableStoreDetails?: boolean;

    /**
     * Comes from Stored payment method object
     * @internal
     */
    expiryMonth?: string;

    /**
     * Allows SF to return an unencrypted expiryDate
     * - merchant set config option
     */
    exposeExpiryDate?: boolean;

    /**
     * Force securedFields to use the 'compat' version of JWE. (Use case: running custom http:// test environment
     * - merchant set config option
     */
    forceCompat?: boolean;

    /**
     * Funding source field populated when 'splitCardFundingSources' is used
     * @internal
     */
    fundingSource?: 'debit' | 'credit';

    /**
     *  Decides whether the CVC (Security Code) component will even be rendered.
     *  Always true except when hideCVC set to false by merchant OR in the case of a *stored* BCMC card.
     *  (For the Bancontact card comp this is set to true since dual-branding possibilities mean the BCMC card can now end up needing to show a CVC field)
     * @internal
     */
    hasCVC?: boolean;

    /**
     * Show/hide the card holder name field
     * - merchant set config option
     */
    hasHolderName?: boolean;

    /**
     * holderName coming from a stored card in /paymentMethods response
     * @internal
     */
    holderName?: string;

    /**
     * Show/hide the Security Code field
     * - merchant set config option
     */
    hideCVC?: boolean;

    /**
     * Whether the card holder name field will be required
     * - merchant set config option
     */
    holderNameRequired?: boolean;

    /**
     * Relates to storedCards
     * @internal
     */
    id?: string;

    /**
     * Configure the installment options for the card
     * - merchant set config option
     */
    installmentOptions?: InstallmentOptions;

    /**
     * Implements a workaround for iOS/Safari bug where keypad doesn't retract when SF paymentMethod is no longer active
     * @defaultValue `true`
     *
     * - merchant set config option
     */
    keypadFix?: boolean; // Keep, but use analytics to record if anyone *ever* uses this config prop

    /**
     * Related to storedCards - this information comes from the storedCardData once we process it
     * @internal
     */
    lastFour?: string;

    /**
     * For some scenarios make the card input fields (PAN, Expiry Date, Security Code) have type="tel" rather than type="text" inputmode="numeric"
     * @defaultValue `false`
     *
     * - merchant set config option
     */
    legacyInputMode?: boolean;

    /**
     * Adds type="password" to the Security code input field, causing its value to be masked
     * @defaultValue `false`
     *
     * - merchant set config option
     */
    maskSecurityCode?: boolean;

    /**
     * Specify the minimum expiry date that will be considered valid
     *
     * - merchant set config option
     */
    minimumExpiryDate?: string;

    /**
     * When in Dropin this is the name shown in the paymentMethods list
     * @defaultValue - derived from PaymentMethods response
     * @internal - but can also be overwritten by merchant config option
     */
    name?: string;

    /**
     * Function used to perform 3rd party Address lookup
     * - merchant set config option
     */
    onAddressLookup?: OnAddressLookupType;

    /**
     * Function used to handle the selected address from 3rd party Address lookup
     * - merchant set config option
     */
    onAddressSelected?: OnAddressSelectedType;

    /**
     * After binLookup call - provides the brand(s) we detect the user is entering, and if we support the brand(s)
     * - merchant set config option
     */
    onBinLookup?: (event: CardBinLookupData) => void;

    /**
     * Provides the BIN Number of the card (up to 6 digits), called as the user types in the PAN.
     * - merchant set config option
     */
    onBinValue?: (event: CardBinValueData) => void;

    /**
     * Called when a field loses focus.
     * - merchant set config option
     */
    onBlur?: (event: CardFocusData | ComponentFocusObject) => void;

    /**
     * Called once we detect the card brand.
     * - merchant set config option
     */
    onBrand?: (event: CardBrandData) => void;

    /**
     * Called once the card input fields are ready to use.
     * - merchant set config option
     */
    onConfigSuccess?: (event: CardConfigSuccessData) => void;

    /**
     * Called when *all* the securedFields becomes valid
     *  Also called again if one of the fields moves out of validity.
     */
    onAllValid?: (event: CardAllValidData) => void;

    /**
     * Called when a field becomes valid and also if a valid field changes and becomes invalid.
     * For the card number field, it returns the last 4 digits of the card number.
     * - merchant set config option
     */
    onFieldValid?: (event: CardFieldValidData) => void;

    /**
     * Called when a field gains focus.
     * - merchant set config option
     */
    onFocus?: (event: CardFocusData | ComponentFocusObject) => void;

    /**
     * Called once all the card input fields have been created but are not yet ready to use.
     * - merchant set config option
     */
    onLoad?: (event: CardLoadData) => void;

    /**
     * Configure placeholder text for holderName, cardNumber, expirationDate, securityCode and password.
     * - merchant set config option
     */
    placeholders?: CardPlaceholders;

    /**
     * Position holder name above card number field (instead of having it after the security code field)
     * @defaultValue `false`
     *
     * - merchant set config option
     */
    positionHolderNameOnTop?: boolean;

    /**
     * Show/hide the brand logo when the card brand has been recognized
     * @defaultValue `true`
     *
     * - merchant set config option
     */
    showBrandIcon?: boolean;

    /**
     * Show/hide the contextual text under each form field. The contextual text is to assist shoppers filling in the payment form.
     * @defaultValue `true`
     *
     * - merchant set config option
     */
    showContextualElement?: boolean;

    /**
     * Set whether to show installments broken down into amounts or months
     * @defaultValue `true`
     *
     * - merchant set config option
     */
    showInstallmentAmounts?: boolean;

    /**
     * Related to storedCards - this information comes from the storedCardData once we process it
     * @internal
     */
    storedPaymentMethodId?: string;

    /**
     * Show/hide the "store details" checkbox
     * @internal
     */
    showStoreDetailsCheckbox?: boolean;

    /**
     * Object to configure the styling of the inputs in the iframes that are used to present the PAN, Expiry Date & Security Code fields
     * - merchant set config option
     */
    styles?: StylesObject;

    /**
     * Relates to storedCards and the type of interactions they support e.g. "Ecommerce", "ContAuth" etc
     * @internal
     */
    supportedShopperInteractions?: string[];

    /**
     * For the PAN field: If the card number is now at one of it's valid lengths and the formatting process has added a separator
     * to the end of the string... delete the separator
     * - merchant set config option. Defaults to true
     */
    trimTrailingSeparator?: boolean;

    /**
     * type will always be "card" (generic card, stored card)
     * except for a single branded card when it will be the same as the brand prop
     * @internal
     */
    type?: string;
}

export type SocialSecurityMode = 'show' | 'hide' | 'auto';

// TODO clarify exact properties that can be in this object
//  - should only be ones that can be sent in the configuration object in the /paymentMethods response
/** If the merchant wishes to set any of these properties in their local config they should do so via a "configuration" object */
export interface CardBackendConfiguration {
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
    localeBrand?: string;
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
    isDualBrandSelection?: boolean;
}

export interface DualBrandSelectElement {
    id: string;
    brandObject: BrandObject;
}
