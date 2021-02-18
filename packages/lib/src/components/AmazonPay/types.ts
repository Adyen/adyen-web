import Language from '../../language/Language';
import { SUPPORTED_LOCALES_EU, SUPPORTED_LOCALES_US } from './config';
import { BrowserInfo, PaymentAmount } from '../../types';
import UIElement from '../UIElement';

declare global {
    interface Window {
        amazon: object;
    }
}

type ButtonColor = 'Gold' | 'LightGray' | 'DarkGray';
type Placement = 'Home' | 'Product' | 'Cart' | 'Checkout' | 'Other';
type ProductType = 'PayOnly' | 'PayAndShip';
type Currency = 'USD' | 'EUR' | 'GBP';
export type Region = 'US' | 'EU' | 'UK';
export type SupportedLocale = typeof SUPPORTED_LOCALES_EU[number] | typeof SUPPORTED_LOCALES_US[number];

export interface AmazonPayConfiguration {
    merchantId?: string;
    publicKeyId?: string;
    storeId?: string;
}

export interface AmazonPayElementProps {
    amazonPayToken?: string;
    amazonCheckoutSessionId?: string;
    amount: PaymentAmount;
    buttonColor?: ButtonColor;
    cancelUrl?: string;
    clientKey?: string;
    configuration?: AmazonPayConfiguration;
    currency?: Currency;
    deliverySpecifications?: DeliverySpecifications;
    environment?: string;
    i18n: Language;
    loadingContext?: string;
    locale?: string;
    onSubmit?: (state: any, element: UIElement) => void;
    payButton?: any;
    placement?: Placement;
    productType?: ProductType;
    region?: Region;
    returnUrl?: string;
    showChangePaymentDetailsButton: boolean;
    showOrderButton: boolean;
    showPayButton: boolean;
    showSignOutButton: boolean;
    signature?: string;
    onClick: (resolve, reject) => Promise<void>;
    onError: (error, component) => void;
    onSignOut: (resolve, reject) => Promise<void>;
}

export interface AmazonPayComponentProps extends AmazonPayElementProps {
    ref: any;
}

export interface AmazonPayButtonProps {
    amazonRef: any;
    buttonColor?: ButtonColor;
    cancelUrl?: string;
    clientKey?: string;
    configuration?: AmazonPayConfiguration;
    currency?: Currency;
    deliverySpecifications?: DeliverySpecifications;
    environment?: string;
    locale?: string;
    onClick: (resolve, reject) => Promise<void>;
    onError: (error, component) => void;
    placement?: Placement;
    productType?: ProductType;
    ref: any;
    region?: Region;
    returnUrl?: string;
    showPayButton: boolean;
}

export interface SignOutButtonProps {
    amazonRef: any;
    onSignOut: (resolve, reject) => Promise<void>;
}

export interface ChangePaymentDetailsButtonProps {
    amazonCheckoutSessionId: string;
    amazonRef: any;
}

export interface ChangeActionOptions {
    amazonCheckoutSessionId: string;
    changeAction: 'changeAddress' | 'changePayment';
}

export interface OrderButtonProps {
    amazonCheckoutSessionId: string;
    amount: PaymentAmount;
    clientKey: string;
    onError: (error, component) => void;
    ref: any;
    returnUrl: string;
}

export interface AmazonPayElementData {
    paymentMethod: {
        type: string;
        checkoutSessionId?: string;
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
}

export interface PayloadJSON {
    storeId: string;
    webCheckoutDetails: {
        checkoutCancelUrl?: string;
        checkoutReviewReturnUrl: string;
    };
    deliverySpecifications?: DeliverySpecifications;
}

export interface CheckoutDetailsRequest {
    checkoutSessionId: string;
    getDeliveryAddress?: boolean;
    getDeclineFlowUrl?: boolean;
}

export interface UpdateAmazonCheckoutSessionRequest {
    amount: PaymentAmount;
    checkoutResultReturnUrl: string;
    checkoutSessionId: string;
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
