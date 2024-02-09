import { PaymentAmount, PaymentMethod, ShopperDetails } from '../../types';
import UIElement from '../UIElement';
import { UIElementProps } from '../types';
import { SUPPORTED_LOCALES } from './config';
import PaypalElement from './Paypal';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
    interface Window {
        paypal: object;
    }
}

/**
 * The intent for the transaction. This determines whether the funds are captured immediately, or later.
 * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#intent}
 */
export type Intent = 'sale' | 'capture' | 'authorize' | 'order' | 'tokenize';

export type FundingSource = 'paypal' | 'credit' | 'paylater' | 'venmo';

export interface PayPalStyles {
    /**
     * @see {@link https://developer.paypal.com/docs/checkout/integration-features/customize-button/#color}
     */
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';

    /**
     * @see {@link https://developer.paypal.com/docs/checkout/integration-features/customize-button/#shape}
     */
    shape?: 'rect' | 'pill';

    /**
     * @see {@link https://developer.paypal.com/docs/checkout/integration-features/customize-button/#height}
     */
    height?: string | number;

    /**
     * @see {@link https://developer.paypal.com/docs/checkout/integration-features/customize-button/#label}
     */
    label?: 'paypal' | 'checkout' | 'buynow' | 'pay';

    /**
     * @see {@link https://developer.paypal.com/docs/checkout/integration-features/customize-button/#tagline}
     */
    tagline?: boolean;

    /**
     * @see {@link https://developer.paypal.com/docs/checkout/integration-features/customize-button/#layout}
     */
    layout?: 'vertical' | 'horizontal';
}

interface PayPalCommonProps {
    /**
     * An Adyen formatted amount object which will be used to pass a currency to the PayPal SDK.
     * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#currency}
     */
    amount?: PaymentAmount;

    configuration?: PayPalConfig;

    /**
     * A two-letter ISO 3166 country code which will be passed to the PayPal SDK as the buyer-country.
     * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#buyer-country}
     */
    countryCode?: string;

    /**
     * Set to true to enable debug mode. Defaults to false.
     * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#debug}
     */
    debug?: boolean;
    environment?: string;

    blockPayPalCreditButton?: boolean;

    /**
     * Set to true to force the UI to not render PayPal Pay Later button
     * @defaultValue false
     */
    blockPayPalPayLaterButton?: boolean;

    /**
     * Set to true to force the UI to not render PayPal Venmo button
     * @defaultValue false
     */
    blockPayPalVenmoButton?: boolean;

    /*
     * Set to true to force the UI to load Paypal Messages Component
     * @defaultValue false
     */
    enableMessages?: boolean;

    /**
     * @see {@link https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-configuration/#csp-nonce}
     */
    cspNonce?: string;

    /**
     * Determines whether the funds are captured immediately on checkout or if the buyer authorizes the funds to be captured later.
     * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#intent}
     *
     * If set, it will override the intent passed inside the 'configuration' object
     */
    intent?: Intent;

    /**
     * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#commit}
     */
    commit?: boolean;

    /**
     * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#vault}
     */
    vault?: boolean;

    /**
     * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#locale}
     */
    locale?: string;

    /**
     * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#merchant-id}
     */
    merchantId?: string;

    /**
     * Internal statuses the component can have.
     */
    status?: 'loading' | 'pending' | 'processing' | 'ready';

    /**
     * @see {@link https://developer.paypal.com/docs/checkout/integration-features/customize-button/}
     */
    style?: PayPalStyles;

    /**
     * @see {@link https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/#oninitonclick}
     */
    onInit?: (data?: object, actions?: object) => void;

    /**
     * @see {@link https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/#oninitonclick}
     */
    onClick?: () => void;

    /**
     * @see {@link https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/#onshippingchange}
     * @deprecated - Use 'onShippingAddressChange' instead, as described in the PayPal docs
     */
    onShippingChange?: (data, actions) => void;

    /**
     * While the buyer is on the PayPal site, you can update their shopping cart to reflect the shipping address they chose on PayPal
     * @see {@link https://developer.paypal.com/sdk/js/reference/#onshippingaddresschange}
     */
    onShippingAddressChange?: (data: any, actions: { reject: () => Promise<void> }) => Promise<void>;

    /**
     * While the buyer is on the PayPal site, you can update their shopping cart to reflect the shipping options they chose on PayPal
     * @see {@link https://developer.paypal.com/sdk/js/reference/#onshippingoptionschange}
     */
    onShippingOptionsChange?: (data: any, actions: { reject: (reason: string) => Promise<void> }) => Promise<void>;

    /**
     *  Identifies if the payment is Express.
     *  @defaultValue false
     */
    isExpress?: boolean;
}

export interface PayPalConfig {
    /**
     * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#merchant-id}
     */
    merchantId: string;
    /**
     * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#intent}
     */
    intent?: Intent;
}

export interface PayPalElementProps extends Omit<PayPalCommonProps, 'onShippingAddressChange' | 'onShippingOptionsChange'>, UIElementProps {
    onSubmit?: (state: any, element: UIElement) => void;
    onComplete?: (state, element?: UIElement) => void;
    onAdditionalDetails?: (state: any, element: UIElement) => void;
    onCancel?: (state: any, element: UIElement) => void;
    onError?: (state: any, element?: UIElement) => void;

    /**
     * While the buyer is on the PayPal site, you can update their shopping cart to reflect the shipping address they chose on PayPal
     * @see {@link https://developer.paypal.com/sdk/js/reference/#onshippingaddresschange}
     *
     * @param data - PayPal data object
     * @param actions - Used to reject the address change in case the address is invalid
     * @param component - Adyen instance of its PayPal implementation. It must be used to manipulate the 'paymentData' in order to apply the amount patch correctly
     */
    onShippingAddressChange?: (data: any, actions: { reject: () => Promise<void> }, component: PaypalElement) => Promise<void>;

    /**
     * This callback is triggered any time the user selects a new shipping option.
     * @see {@link https://developer.paypal.com/sdk/js/reference/#onshippingoptionschange}
     *
     * @param data - An PayPal object containing the payer’s selected shipping option
     * @param actions - Used to indicates to PayPal that you will not support the shipping method selected by the buyer
     * @param component - Adyen instance of its PayPal implementation. It must be used to manipulate the 'paymentData' in order to apply the amount patch correctly
     */
    onShippingOptionsChange?: (data: any, actions: { reject: (reason: string) => Promise<void> }, component: PaypalElement) => Promise<void>;

    /**
     * If set to 'continue' , the button inside the lightbox will display the 'Continue' button
     * @default pay
     */
    userAction?: 'continue' | 'pay';

    onShopperDetails?(shopperDetails: ShopperDetails, rawData: any, actions: { resolve: () => void; reject: () => void }): void;
    paymentMethods?: PaymentMethod[];
    showPayButton?: boolean;
}

export interface PayPalComponentProps extends PayPalCommonProps {
    onApprove: (data: any, actions: any) => void;
    onCancel?: (data: object) => void;
    onChange?: (newState: object) => void;
    onError?: (data: object) => void;
    onSubmit?: () => Promise<any>;
    ref?: any;
}

export interface PayPalButtonsProps extends PayPalComponentProps {
    paypalRef: any;
    isProcessingPayment: boolean;
}

export interface PaypalSettings {
    'merchant-id'?: string;
    locale?: string;
    'buyer-country': string;
    currency?: string;
    debug?: boolean;
    intent?: Intent;
    commit?: boolean;
    vault?: boolean;
    'client-id': string;
    'integration-date': string;
    'enable-funding': string;
    components: string;
}

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
