import { PaymentAmount, PaymentMethod } from '../../types';
import UIElement from '../UIElement';
import { UIElementProps } from '../types';
import { SUPPORTED_LOCALES } from './config';

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
type Intent = 'sale' | 'capture' | 'authorize' | 'order' | 'tokenize';

export type FundingSource = 'paypal' | 'credit';

interface PayPalStyles {
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

    /**
     * @see {@link https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-configuration/#csp-nonce}
     */
    cspNonce?: string;

    /**
     * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#intent}
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
     */
    onShippingChange?: (data, actions) => void;
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

export interface PayPalElementProps extends PayPalCommonProps, UIElementProps {
    onSubmit?: (state: any, element: UIElement) => void;
    onComplete?: (state, element?: UIElement) => void;
    onAdditionalDetails?: (state: any, element: UIElement) => void;
    onCancel?: (state: any, element: UIElement) => void;
    onError?: (state: any, element?: UIElement) => void;
    paymentMethods?: PaymentMethod[];
    showPayButton?: boolean;
}

export interface PayPalComponentProps extends PayPalCommonProps {
    onCancel?: (data: object) => void;
    onChange?: (newState: object) => void;
    onComplete?: (details: object) => void;
    onError?: (data: object) => void;
    onSubmit?: () => Promise<any>;
    ref?: any;
}

export interface PayPalButtonsProps extends PayPalComponentProps {
    paypalRef: any;
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

export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
