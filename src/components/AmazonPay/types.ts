import Language from '~/language/Language';
import { SUPPORTED_LOCALES_EU, SUPPORTED_LOCALES_US } from '~/components/AmazonPay/config';

declare global {
    interface Window {
        amazon: object;
    }
}

type Placement = 'Home' | 'Product' | 'Cart' | 'Checkout' | 'Other';
type ProductType = 'PayOnly' | 'PayAndShip';
type Currency = 'USD' | 'EUR' | 'GBP';
export type Region = 'US' | 'EU' | 'UK';
export type SupportedLocale = typeof SUPPORTED_LOCALES_EU[number] | typeof SUPPORTED_LOCALES_US[number];

export interface AmazonPayCommonProps {
    checkoutSessionId?: string;
    clientKey?: string;
    currency?: Currency;
    deliverySpecifications?: DeliverySpecifications;
    environment?: string;
    loadingContext?: string;
    locale?: string;
    merchantId?: string;
    originKey?: string;
    placement?: Placement;
    productType?: ProductType;
    publicKeyId?: string;
    region?: Region;
    returnUrl?: string;
    showPayButton?: boolean;
    signature?: string;
    storeId?: string;
    onError: (error) => void;
}

export interface AmazonPayComponentProps extends AmazonPayCommonProps {
    ref: any;
}

export interface AmazonPayButtonProps extends AmazonPayCommonProps {
    amazonRef: any;
}

export interface AmazonPayElementProps extends AmazonPayCommonProps {
    i18n: Language;
    loadingContext: string;
}

export interface AmazonPayButtonSettings {
    /**
     * Amazon Pay merchant account identifier
     */
    merchantId: string;

    /**
     * Sets button to Sandbox environment
     */
    sandbox: boolean;

    /**
     * Product type selected for checkout
     */
    productType: ProductType;

    /**
     * Placement of the Amazon Pay button on your website
     */
    placement: Placement;

    /**
     * Language used to render the button and text on Amazon Pay hosted pages. Please note that supported language(s) is dependent on the region that your Amazon Pay account was registered for
     */
    checkoutLanguage: SupportedLocale;

    /**
     * Ledger currency provided during registration for the given merchant identifier
     */
    ledgerCurrency: Currency;

    /**
     * Create Checkout Session configuration
     */
    createCheckoutSessionConfig: CreateCheckoutSessionConfig;
}

export interface PayloadJSON {
    storeId: string;
    webCheckoutDetails: {
        checkoutReviewReturnUrl: string;
    };
    deliverySpecifications?: DeliverySpecifications;
}

interface CreateCheckoutSessionConfig {
    payloadJSON: string;
    signature: string;
    publicKeyId: string;
}

export interface DeliverySpecifications {
    specialRestrictions?: string[];
    addressRestrictions?: AddressRestrictions;
}

interface AddressRestrictions {
    type?: 'Allowed' | 'NotAllowed';
    restrictions?: Restrictions;
}

interface Restrictions {
    [key: string]: {
        zipCodes?: string[];
        statesOrRegions?: string[];
    };
}
