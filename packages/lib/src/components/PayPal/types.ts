import { AddressData } from '../../types/global-types';
import { UIElementProps } from '../internal/UIElement/types';
import { PayPalButtonStyle, PayPalVenmoButtonStyle } from './components/types';
import { BasePaypalElement } from './models/BasePaypalElement';
import PaypalElement from './Paypal';
import type {
    PayPalFetchContentOptions,
    PayPalMessagesOptions,
    PayPalMessagesSession,
    PayPalOnInitActions,
    PayPalOnShippingAddressChangeData,
    PayPalOnShippingOptionsChangeData,
    PayPalOrderResponseBody,
    PayPalPageTypes,
    PayPalV6OnShippingAddressChangeData,
    PayPalV6OnShippingOptionsChangeData,
    PayPalPresentationModeOptions
} from './paypal-js-types';
import { PayPalOrderDetailsData } from './services/request-paypal-order-details';

type PayPalV6Props<E extends PaypalElement | BasePaypalElement> = {
    /**
     * The type of page where the SDK is being initialized. This helps PayPal optimize the payment experience and provide better analytics.
     * @see {@link https://docs.paypal.ai/developer/how-to/sdk/js/v6/configuration#parameters}
     * @default "checkout"
     */
    pageType?: PayPalPageTypes;
    /**
     * Set to true to enable vaulting of the payment method (save for future use).
     * @default false
     */
    vault?: boolean;
    /**
     * Pass a Content Security Policy single-use token if you use them on your site
     *
     * @default undefined
     */
    nonce?: string;
    /**
     * Controls the final button text in the PayPal flow.
     *  - true — Shows “Pay Now” (payment happens immediately)
     *  - false — Shows “Continue” (additional confirmation step)
     * @default true
     * @see {@link https://docs.paypal.ai/reference/sdk/js/v6/reference#parameters-4}
     */
    commit?: boolean;
    /**
     * A two-letter ISO 3166 country code which will be passed to the PayPal SDK as the buyer-country.
     * Note: The buyer country is only used in the sandbox. Don't pass this query parameter in production.
     *
     * @see {@link https://developer.paypal.com/sdk/js/configuration/#buyer-country}
     * @default undefined
     */
    countryCode?: string;
    /**
     * The locale for the UI components, specified as a BCP-47 language tag, for example, "en-US", "fr-FR", "de-DE". If not specified, the SDK automatically detects the buyer’s locale from their browser settings.
     *
     * @see {@link https://docs.paypal.ai/developer/how-to/sdk/js/v6/configuration#parameters}
     * @default undefined
     */
    locale?: string;
    /**
     * Called when the buyer selects or changes their shipping address within the PayPal flow. Use this callback to update shipping costs, validate addresses, or apply location-based restrictions.
     *
     * @see {@link https://docs.paypal.ai/reference/sdk/js/v6/reference#onshippingaddresschange-data}
     *
     * @param data - The shipping address change data
     * @param component - The PayPal component instance
     */
    onShippingAddressChange?: (data: PayPalV6OnShippingAddressChangeData, component: E) => Promise<void>;
    /**
     * Called when the buyer selects a different shipping option, for example, standard or express delivery. Use this to update the order total with the selected shipping cost.
     *
     * @see {@link https://docs.paypal.ai/reference/sdk/js/v6/reference#onshippingoptionschange-data}
     *
     * @param data - The shipping options change data
     * @param component - The PayPal component instance
     */
    onShippingOptionsChange?: (data: PayPalV6OnShippingOptionsChangeData, component: E) => Promise<void>;
    /**
     * Callback called when PayPal authorizes the payment.
     * Must be resolved/rejected with the action object. If resolved, the additional details will be invoked. Otherwise it will be skipped
     *
     * @param data - Contains the raw event from PayPal, along with the billingAddress and deliveryAddress parsed by Adyen based on the raw event data
     * @param actions - Used to indicate that payment flow must continue or must stop
     */
    onAuthorized?: (
        data: Pick<PayPalOrderDetailsData, 'billingAddress' | 'deliveryAddress' | 'shopperName'> & {
            authorizedEvent: PayPalOrderDetailsData['payPalOrder'];
        },
        actions: { resolve: () => void; reject: () => void }
    ) => void;
    /**
     * Callback called to enable creating the PayPal messages component.
     * @param createPayPalMessages - Function to create the messages component
     * @returns
     */
    onCreatePayPalMessages?: (createPayPalMessages: (messagesOptions?: PayPalMessagesOptions) => PayPalMessagesSession) => void;
    /**
     * Configuration for how the payment UI is presented.
     *
     * @see {@link https://docs.paypal.ai/reference/sdk/js/v6/reference#paymentsession-start-options-orderpromise}
     * @default  presentationMode: 'auto'
     * @description { presentationMode: 'auto' } - Recommended. SDK automatically selects the best experience. Does not yet support 'redirect' mode.
     */
    presentationModeOptions?: PayPalPresentationModeOptions;
};

type PayPalInternalConfiguration = {
    /**
     * @see {@link https://developer.paypal.com/sdk/js/configuration/#merchant-id}
     */
    merchantId?: string;
    /**
     * @see {@link https://developer.paypal.com/sdk/js/configuration/#intent}
     */
    intent?: Intent;
};

export interface PayPalConfiguration extends UIElementProps {
    /**
     * Configuration returned by the backend
     * @internal
     */
    configuration?: PayPalInternalConfiguration;

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
     * Set to true to force the UI to not render PayPal button
     * @default false
     */
    blockPayPalButton?: boolean;

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
        data: { authorizedEvent: PayPalOrderResponseBody; billingAddress?: Partial<AddressData>; deliveryAddress?: Partial<AddressData> },
        actions: { resolve: () => void; reject: () => void }
    ) => void;

    /**
     * While the buyer is on the PayPal site, you can update their shopping cart to reflect the shipping address they chose on PayPal
     * @see {@link https://developer.paypal.com/sdk/js/reference/#on-shipping-address-change}
     *
     * @param data - PayPal data object
     * @param actions - Used to reject the address change in case the address is invalid
     * @param component - Adyen instance of its PayPal implementation. It must be used to manipulate the 'paymentData' in order to apply the amount patch correctly
     */
    onShippingAddressChange?: (
        data: PayPalOnShippingAddressChangeData,
        actions: { reject: (reason?: string) => Promise<void> },
        component: PaypalElement
    ) => Promise<void>;

    /**
     * This callback is triggered any time the user selects a new shipping option.
     * @see {@link https://developer.paypal.com/sdk/js/reference/#on-shipping-options-change}
     *
     * @param data - An PayPal object containing the payer’s selected shipping option
     * @param actions - Used to indicates to PayPal that you will not support the shipping method selected by the buyer
     * @param component - Adyen instance of its PayPal implementation. It must be used to manipulate the 'paymentData' in order to apply the amount patch correctly
     */
    onShippingOptionsChange?: (
        data: PayPalOnShippingOptionsChangeData,
        actions: { reject: (reason?: string) => Promise<void> },
        component: PaypalElement
    ) => Promise<void>;

    /**
     * If set to 'continue' , the button inside the lightbox will display the 'Continue' button
     * @default pay
     */
    userAction?: 'continue' | 'pay';

    /**
     * Customize your buttons using the style option.
     *
     * @see {@link https://developer.paypal.com/sdk/js/reference/#style}
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
     * @see {@link https://developer.paypal.com/sdk/js/reference/#oninitonclick}
     */
    onInit?: (data?: Record<string, unknown>, actions?: PayPalOnInitActions) => void;

    /**
     * @see {@link https://developer.paypal.com/sdk/js/reference/#oninitonclick}
     */
    onClick?: () => void;

    /**
     * The commit status of the transaction. Determines whether to show a Pay Now or Continue button in the Checkout flow.
     *
     * @see {@link https://developer.paypal.com/sdk/js/configuration/#commit}
     * @default true
     */
    commit?: boolean;

    /**
     * Whether the payment information in the transaction will be saved. Save your customers' payment information for billing agreements, subscriptions, or recurring payments.
     *
     * @see {@link https://developer.paypal.com/sdk/js/configuration/#vault}
     * @default false
     */
    vault?: boolean;

    /**
     * The locale renders components. By default PayPal detects the correct locale for the buyer based on their geolocation and browser preferences.
     *
     * @see {@link https://developer.paypal.com/sdk/js/configuration/#locale}
     * @default undefined
     */
    locale?: string;

    /**
     * Determines whether the funds are captured immediately on checkout or if the buyer authorizes the funds to be captured later.
     * If set, it will override the intent passed inside the 'configuration' object
     *
     * @see {@link https://developer.paypal.com/sdk/js/configuration/#intent}
     * @default undefined
     */
    intent?: Intent;

    /**
     * Pass a Content Security Policy single-use token if you use them on your site
     *
     * @see {@link https://developer.paypal.com/sdk/js/configuration/#data-csp-nonce}
     * @default undefined
     */
    cspNonce?: string;

    /*
     * Set to true to force the UI to load PayPal Messages Component
     *
     * @see {@link https://developer.paypal.com/sdk/js/configuration/#components}
     * @default false
     */
    enableMessages?: boolean;

    /**
     * Set to true to enable debug mode. Defaults to false.
     * @see {@link https://developer.paypal.com/sdk/js/configuration/#debug}
     * @default undefined
     */
    debug?: boolean;

    /**
     * A two-letter ISO 3166 country code which will be passed to the PayPal SDK as the buyer-country.
     * Note: The buyer country is only used in the sandbox. Don't pass this query parameter in production.
     *
     * @see {@link https://developer.paypal.com/sdk/js/configuration/#buyer-country}
     * @default undefined
     */
    countryCode?: string;

    /**
     * Use PayPal V6 SDK instead of V5
     * @default undefined
     */
    usePayPalV6?: PayPalV6Props<PaypalElement> & {
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
         * Callback called to enable creating the PayPal messages component.
         * @param createPayPalMessages - Function to create the messages component
         * @returns
         */
        onCreatePayPalMessages?: (createPayPalMessages: (messagesOptions?: PayPalMessagesOptions) => PayPalMessagesSession) => void;
        style?: {
            paypal?: PayPalButtonStyle;
            venmo?: PayPalVenmoButtonStyle;
        };
    };
}

export type BasePayPalConfiguration = UIElementProps &
    PayPalV6Props<BasePaypalElement> & {
        /**
         * Configuration returned by the backend
         * @internal
         */
        configuration?: PayPalInternalConfiguration;
        /**
         *  Identifies if the payment is Express. Also used for analytics
         *  @defaultValue false
         */
        isExpress?: boolean;
        /**
         * Used for analytics
         */
        expressPage?: 'cart' | 'minicart' | 'pdp' | 'checkout';
    };

export type PayPalPayLaterConfiguration = Omit<BasePayPalConfiguration, 'vault'> & {
    /**
     * Set to true to hide the PayPal messages component
     * @default false
     */
    hidePayPalMessaging?: boolean;
    /**
     * Callback called when the PayPal messages component is created
     * @param createPayPalMessages - Function to create the messages component
     * @returns
     */
    onCreatePayPalMessages?: (createPayPalMessages: (messagesOptions?: PayPalMessagesOptions) => PayPalMessagesSession) => void;
    /**
     * Options for fetching PayPal messages content
     * @see {@link https://docs.paypal.ai/reference/sdk/js/v6/reference#messagesinstance-fetchcontent-options}
     */
    messagingContentOptions?: Pick<PayPalFetchContentOptions, 'logoType' | 'logoPosition' | 'textColor'>;
};

export type VenmoConfiguration = Omit<
    BasePayPalConfiguration,
    'isExpress' | 'expressPage' | 'onShippingAddressChange' | 'onShippingOptionsChange'
> & {
    style?: PayPalVenmoButtonStyle;
};

/**
 * The intent for the transaction. This determines whether the funds are captured immediately, or later.
 * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/#intent}
 */
export type Intent = 'sale' | 'capture' | 'authorize' | 'order' | 'tokenize';

export type SupportedPayPalFundingSources = 'paypal' | 'credit' | 'paylater' | 'venmo';

/**
 * @deprecated Use {@link SupportedPayPalFundingSources} instead
 */
export type FundingSource = SupportedPayPalFundingSources;
