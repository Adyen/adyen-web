import { AddressData } from '../../types/global-types';
import { UIElementProps } from '../internal/UIElement/types';
import PaypalElement from './Paypal';

declare global {
    interface Window {
        paypal: object;
    }
}

export interface PayPalConfiguration extends UIElementProps {
    /**
     * Configuration returned by the backend
     * @internal
     */
    configuration?: {
        /**
         * @see {@link https://developer.paypal.com/sdk/js/configuration/#link-merchantid}
         */
        merchantId: string;
        /**
         * @see {@link https://developer.paypal.com/sdk/js/configuration/#link-intent}
         */
        intent?: Intent;
    };

    /**
     *  Identifies if the payment is Express. Also used for analytics
     *  @defaultValue false
     */
    isExpress?: boolean;

    /**
     * Used for analytics
     */
    expressPage?: 'cart' | 'minicart' | 'pdp' | 'checkout';

    /**
     * Set to true to force the UI to not render PayPal Credit button
     * @default false
     */
    blockPayPalCreditButton?: boolean;

    /**
     * Set to true to force the UI to not render PayPal Pay Later button
     * @default false
     */
    blockPayPalPayLaterButton?: boolean;

    /**
     * Set to true to force the UI to not render PayPal Venmo button
     * @default false
     */
    blockPayPalVenmoButton?: boolean;

    /**
     * Callback called when PayPal authorizes the payment.
     * Must be resolved/rejected with the action object. If resolved, the additional details will be invoked. Otherwise it will be skipped
     *
     * @param data - Contains the raw event from PayPal, along with the billingAddress and deliveryAddress parsed by Adyen based on the raw event data
     * @param actions - Used to indicate that payment flow must continue or must stop
     */
    onAuthorized?: (
        data: { authorizedEvent: any; billingAddress?: Partial<AddressData>; deliveryAddress?: Partial<AddressData> },
        actions: { resolve: () => void; reject: () => void }
    ) => void;

    /**
     * While the buyer is on the PayPal site, you can update their shopping cart to reflect the shipping address they chose on PayPal
     * @see {@link https://developer.paypal.com/sdk/js/reference/#onshippingaddresschange}
     *
     * @param data - PayPal data object
     * @param actions - Used to reject the address change in case the address is invalid
     * @param component - Adyen instance of its PayPal implementation. It must be used to manipulate the 'paymentData' in order to apply the amount patch correctly
     */
    onShippingAddressChange?: (data: any, actions: { reject: (reason?: string) => Promise<void> }, component: PaypalElement) => Promise<void>;

    /**
     * This callback is triggered any time the user selects a new shipping option.
     * @see {@link https://developer.paypal.com/sdk/js/reference/#onshippingoptionschange}
     *
     * @param data - An PayPal object containing the payer’s selected shipping option
     * @param actions - Used to indicates to PayPal that you will not support the shipping method selected by the buyer
     * @param component - Adyen instance of its PayPal implementation. It must be used to manipulate the 'paymentData' in order to apply the amount patch correctly
     */
    onShippingOptionsChange?: (data: any, actions: { reject: (reason?: string) => Promise<void> }, component: PaypalElement) => Promise<void>;

    /**
     * If set to 'continue' , the button inside the lightbox will display the 'Continue' button
     * @default pay
     */
    userAction?: 'continue' | 'pay';

    /**
     * Customize your buttons using the style option.
     *
     * @see {@link https://developer.paypal.com/sdk/js/reference/#link-style}
     * @default style.height 48px
     */
    style?: {
        layout?: 'vertical' | 'horizontal';
        color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
        shape?: 'rect' | 'pill';
        height?: string | number;
        disableMaxWidth?: boolean;
        label?: 'paypal' | 'checkout' | 'buynow' | 'pay';
        tagline?: boolean;
    };

    /**
     * Called when the button first renders. You can use it for validations on your page if you are unable to do so prior to rendering.
     * @see {@link https://developer.paypal.com/sdk/js/reference/#link-oninitonclick}
     */
    onInit?: (data?: any, actions?: any) => void;

    /**
     * @see {@link https://developer.paypal.com/sdk/js/reference/#link-oninitonclick}
     */
    onClick?: () => void;

    /**
     * The commit status of the transaction. Determines whether to show a Pay Now or Continue button in the Checkout flow.
     *
     * @see {@link https://developer.paypal.com/sdk/js/configuration/#link-commit}
     * @default true
     */
    commit?: boolean;

    /**
     * Whether the payment information in the transaction will be saved. Save your customers' payment information for billing agreements, subscriptions, or recurring payments.
     *
     * @see {@link https://developer.paypal.com/sdk/js/configuration/#link-vault}
     * @default false
     */
    vault?: boolean;

    /**
     * The locale renders components. By default PayPal detects the correct locale for the buyer based on their geolocation and browser preferences.
     *
     * @see {@link https://developer.paypal.com/sdk/js/configuration/#link-locale}
     * @default undefined
     */
    locale?: string;

    /**
     * Determines whether the funds are captured immediately on checkout or if the buyer authorizes the funds to be captured later.
     * If set, it will override the intent passed inside the 'configuration' object
     *
     * @see {@link https://developer.paypal.com/sdk/js/configuration/#link-intent}
     * @default undefined
     */
    intent?: Intent;

    /**
     * Pass a Content Security Policy single-use token if you use them on your site
     *
     * @see {@link https://developer.paypal.com/sdk/js/configuration/#link-datacspnonce}
     * @default undefined
     */
    cspNonce?: string;

    /*
     * Set to true to force the UI to load PayPal Messages Component
     *
     * @see {@link https://developer.paypal.com/sdk/js/configuration/#link-components}
     * @default false
     */
    enableMessages?: boolean;

    /**
     * Set to true to enable debug mode. Defaults to false.
     * @see {@link https://developer.paypal.com/sdk/js/configuration/#link-debug}
     * @default undefined
     */
    debug?: boolean;

    /**
     * A two-letter ISO 3166 country code which will be passed to the PayPal SDK as the buyer-country.
     * Note: The buyer country is only used in the sandbox. Don't pass this query parameter in production.
     *
     * @see {@link https://developer.paypal.com/sdk/js/configuration/#link-buyercountry}
     * @default undefined
     */
    countryCode?: string;
}

/**
 * The intent for the transaction. This determines whether the funds are captured immediately, or later.
 * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#intent}
 */
export type Intent = 'sale' | 'capture' | 'authorize' | 'order' | 'tokenize';

export type FundingSource = 'paypal' | 'credit' | 'paylater' | 'venmo';
