import { UIElementProps } from '../internal/UIElement/types';
import { AddressData } from '../../types/global-types';

type Initiative = 'web' | 'messaging';

export type ApplePayPaymentOrderDetails = {
    orderTypeIdentifier: string;
    orderIdentifier: string;
    webServiceURL: string;
    authenticationToken: string;
};

// @types/applepayjs package does not contain 'orderDetails' yet, so we create our own type
export type ApplePayPaymentAuthorizationResult = ApplePayJS.ApplePayPaymentAuthorizationResult & {
    orderDetails?: ApplePayPaymentOrderDetails;
};

export type ApplePayButtonType =
    | 'add-money'
    | 'book'
    | 'buy'
    | 'check-out'
    | 'continue'
    | 'contribute'
    | 'donate'
    | 'order'
    | 'pay'
    | 'plain'
    | 'reload'
    | 'rent'
    | 'set-up'
    | 'subscribe'
    | 'support'
    | 'tip'
    | 'top-up';

export type ApplePayButtonStyle = 'black' | 'white' | 'white-outline';

export interface ApplePayConfiguration extends UIElementProps {
    /**
     * Enables the ApplePay Express Flow & also used for analytics
     * @defaultValue false
     */
    isExpress?: boolean;

    /**
     * Used for analytics
     */
    expressPage?: 'cart' | 'minicart' | 'pdp' | 'checkout';

    /**
     * The Apple Pay version number your website supports.
     * @default highest supported version by the shopper device
     * @see {@link https://developer.apple.com/documentation/apple_pay_on_the_web/apple_pay_on_the_web_version_history Apple Pay on the Web Version History}
     */
    version?: number;

    /**
     * Part of the 'ApplePayLineItem' object, which sets the label of the payment request
     * @see {@link https://developer.apple.com/documentation/apple_pay_on_the_web/applepaylineitem ApplePayLineItem docs}
     */
    totalPriceLabel?: string;

    /**
     * @default 'final'
     */
    totalPriceStatus?: ApplePayJS.ApplePayLineItemType;

    /**
     * ApplePay configuration sent by the /paymentMethods response
     */
    configuration?: {
        merchantName?: string;
        merchantId?: string;
    };

    /**
     * Used to override the domain name for the Apple Pay button. Useful when using ApplePay within cross-domain iframe
     * For more context: https://github.com/Adyen/adyen-web/pull/3340
     */
    domainName?: string;

    clientKey?: string;
    initiative?: Initiative;

    /**
     * A set of line items that explain recurring payments and/or additional charges.
     */
    lineItems?: ApplePayJS.ApplePayLineItem[];

    /**
     * The payment capabilities supported by the merchant.
     * The value must at least contain ApplePayMerchantCapability.supports3DS.
     * @default ['supports3DS']
     */
    merchantCapabilities?: ApplePayJS.ApplePayMerchantCapability[];

    /**
     * A value that indicates whether the shipping mode prevents the user from editing the shipping address.
     * {@link https://developer.apple.com/documentation/applepayontheweb/applepaypaymentrequest/shippingcontacteditingmode}
     */
    shippingContactEditingMode?: ApplePayJS.ApplePayShippingContactEditingMode;

    /**
     * A set of shipping method objects that describe the available shipping methods.
     */
    shippingMethods?: ApplePayJS.ApplePayShippingMethod[];

    /**
     * How the items are to be shipped.
     */
    shippingType?: ApplePayJS.ApplePayShippingType;

    /**
     * A list of ISO 3166 country codes for limiting payments to cards from specific countries.
     */
    supportedCountries?: string[];

    /**
     * The payment networks supported by the merchant.
     */
    supportedNetworks?: string[];

    /**
     * ApplePayRecurringPaymentRequest - Represents a request to set up a recurring payment, typically a subscription.
     * {@link https://developer.apple.com/documentation/apple_pay_on_the_web/applepayrecurringpaymentrequest}
     */
    recurringPaymentRequest?: ApplePayJS.ApplePayRecurringPaymentRequest;

    // Requested Billing and Shipping Contact Information

    /**
     * The billing information that you require from the user in order to process the transaction.
     */
    requiredBillingContactFields?: ApplePayJS.ApplePayContactField[];

    /**
     * The shipping information that you require from the user in order to fulfill the order.
     */
    requiredShippingContactFields?: ApplePayJS.ApplePayContactField[];

    // Known Contact Information

    /**
     * Billing contact information for the user.
     */
    billingContact?: ApplePayJS.ApplePayPaymentContact;
    /**
     * Shipping contact information for the user.
     */
    shippingContact?: ApplePayJS.ApplePayPaymentContact;

    /**
     * It can be used to render the Apple Pay Code in a new window rather than as an overlay modal
     * Recommended to be used in case of using Apple Pay within an iframe, where the modal may not be presented correctly over the parent website
     *
     * @defaultValue 'modal'
     */
    renderApplePayCodeAs?: ApplePayWebConfiguration['renderApplePayCodeAs'];

    /**
     * Optional user-defined data.
     */
    applicationData?: string;

    // Events
    onClick?: (resolve, reject) => void;

    /**
     * A callback function the Apple Pay SDK calls when the Apple Pay code modal or window closes.
     */
    onApplePayCodeClose?: ApplePayWebConfiguration['onApplePayCodeClose'];

    /**
     * Callback called when ApplePay authorize the payment.
     * Must be resolved/rejected with the action object.
     *
     * @param data - Authorization event from ApplePay, along with formatted billingAddress and deliveryAddress
     * @param actions - Object to continue/stop with the payment flow
     *
     * @remarks
     * If actions.resolve() is called, the payment flow will be triggered.
     * If actions.reject() is called, the overlay will display an error
     */
    onAuthorized?: (
        data: {
            authorizedEvent: ApplePayJS.ApplePayPaymentAuthorizedEvent;
            billingAddress?: Partial<AddressData>;
            deliveryAddress?: Partial<AddressData>;
        },
        actions: { resolve: () => void; reject: (error?: ApplePayJS.ApplePayError) => void }
    ) => void;

    /**
     * Collect the order tracking details if available.
     * This callback is invoked when a successfull payment is resolved
     *
     * {@link https://developer.apple.com/documentation/apple_pay_on_the_web/applepaypaymentorderdetails}
     * @param resolve - Must be called with the orderDetails fields
     * @param reject - Must be called if something failed during the order creation. Calling 'reject' won't cancel the payment flow
     */
    onOrderTrackingRequest?: (resolve: (orderDetails: ApplePayPaymentOrderDetails) => void, reject: () => void) => void;

    onValidateMerchant?: (resolve, reject, validationURL: string) => void;

    /**
     * {@link https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession/1778013-onpaymentmethodselected}
     * @param resolve(ApplePayPaymentMethodUpdate update) Completes the selection of a payment method with an update.
     * @param reject() Completes the selection of a payment method with no update.
     * @param event The event parameter contains the paymentMethod attribute.
     */
    onPaymentMethodSelected?: (resolve, reject, event: ApplePayJS.ApplePayPaymentMethodSelectedEvent) => void;

    /**
     * {@link https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession/1778009-onshippingcontactselected}
     * @param resolve(ApplePayShippingContactUpdate update) Completes the selection of a shipping contact with an update.
     * @param reject() Completes the selection of a shipping contact with no update.
     * @param event The event parameter contains the shippingContact attribute.
     */
    onShippingContactSelected?: (resolve, reject, event: ApplePayJS.ApplePayShippingContactSelectedEvent) => void;

    /**
     * {@link https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession/1778028-onshippingmethodselected}
     * @param resolve(ApplePayShippingMethodUpdate update) Completes the selection of a shipping method with an update.
     * @param reject() Completes the selection of a shipping method with no update.
     * @param event The event parameter contains the shippingMethod attribute.
     */
    onShippingMethodSelected?: (resolve, reject, event: ApplePayJS.ApplePayShippingMethodSelectedEvent) => void;

    buttonColor?: ApplePayButtonStyle;
    buttonType?: ApplePayButtonType;
    /**
     * Used to tweak the text of the button types that contain text ('Continue with', 'Book with', etc)
     */
    buttonLocale?: string;
}

export interface ApplePayElementData {
    paymentMethod: {
        type: string;
        applePayToken: string;
        isExpress?: boolean;
    };
    billingAddress?: AddressData;
    deliveryAddress?: AddressData;
}

export interface ApplePaySessionRequest {
    displayName: string;
    domainName: string;
    initiative: Initiative;
    merchantIdentifier: string;
}

export interface ApplePayWebConfiguration {
    renderApplePayCodeAs?: 'modal' | 'window';
    onApplePayCodeClose?(): void;
}
