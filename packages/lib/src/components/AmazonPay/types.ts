import Language from '../../language/Language';
import { SUPPORTED_LOCALES_EU, SUPPORTED_LOCALES_US } from './config';
import { BrowserInfo } from '../../types';

declare global {
    interface Window {
        amazon: object;
    }
}

type ButtonColor = 'Gold' | 'LightGray' | 'DarkGray';
type Size = 'small' | 'medium' | 'large' | 'x-large';
type Placement = 'Home' | 'Product' | 'Cart' | 'Checkout' | 'Other';
type ProductType = 'PayOnly' | 'PayAndShip';
type Currency = 'USD' | 'EUR' | 'GBP';
export type Region = 'US' | 'EU' | 'UK';
export type SupportedLocale = typeof SUPPORTED_LOCALES_EU[number] | typeof SUPPORTED_LOCALES_US[number];

export interface AmazonPayCommonProps {
    amazonPayToken?: string;
    amazonCheckoutSessionId?: string;
    buttonColor?: ButtonColor;
    clientKey?: string;
    currency?: Currency;
    deliverySpecifications?: DeliverySpecifications;
    environment?: string;
    loadingContext?: string;
    locale?: string;
    merchantId?: string;
    originKey?: string;
    payButton?: any;
    placement?: Placement;
    productType?: ProductType;
    publicKeyId?: string;
    region?: Region;
    returnUrl?: string;
    showOrderButton: boolean;
    showChangePaymentDetailsButton: boolean;
    showSignOutButton: boolean;
    showPayButton: boolean;
    signature?: string;
    size?: Size;
    storeId?: string;
    onClick: (resolve, reject) => Promise<void>;
    onSignOut: (resolve, reject) => Promise<void>;
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

export interface AmazonPayElementData {
    paymentMethod: {
        type: string;
        amazonCheckoutSessionId?: string;
    };
    browserInfo: BrowserInfo;
}

export interface AmazonPayButtonSettings {
    buttonColor: ButtonColor;
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

    size?: Size;
}

export interface PayloadJSON {
    storeId: string;
    webCheckoutDetails: {
        checkoutReviewReturnUrl: string;
    };
    deliverySpecifications?: DeliverySpecifications;
}

export interface CheckoutSessionConfig {
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
