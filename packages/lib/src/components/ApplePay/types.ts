import { UIElementProps } from '../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
    interface Window {
        ApplePaySession: ApplePaySession;
    }
}

type Initiative = 'web' | 'messaging';

export type ApplePayButtonType =
    | 'plain'
    | 'buy'
    | 'donate'
    | 'check-out'
    | 'book'
    | 'subscribe'
    | 'add-money'
    | 'contribute'
    | 'order'
    | 'reload'
    | 'rent'
    | 'support'
    | 'tip'
    | 'top-up';

export type OnAuthorizedCallback = (
    resolve: (result?: ApplePayJS.ApplePayPaymentAuthorizationResult) => void,
    reject: (result?: ApplePayJS.ApplePayPaymentAuthorizationResult) => void,
    event: ApplePayJS.ApplePayPaymentAuthorizedEvent
) => void;

export interface ApplePayElementProps extends UIElementProps {
    /**
     * The Apple Pay version number your website supports.
     * @default highest supported version by the shopper device
     * @see {@link https://developer.apple.com/documentation/apple_pay_on_the_web/apple_pay_on_the_web_version_history Apple Pay on the Web Version History}
     */
    version?: number;

    /**
     * The merchant’s two-letter ISO 3166 country code.
     */
    countryCode: string;

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
    recurringPaymentRequest?: {
        paymentDescription: string;
        regularBilling: ApplePayJS.ApplePayLineItem;
        trialBilling?: ApplePayJS.ApplePayLineItem;
        billingAgreement?: string;
        managementURL: string;
        tokenNotificationURL?: string;
    };

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
     * Optional user-defined data.
     */
    applicationData?: string;

    // Events

    onClick?: (resolve, reject) => void;

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

    // ButtonOptions
    buttonColor?: 'black' | 'white' | 'white-with-line';
    buttonType?: ApplePayButtonType;

    /**
     * Show or hide the Apple Pay button
     */
    showPayButton?: boolean;
}

export interface ApplePayElementData {
    paymentMethod: {
        type: string;
        applePayToken: string;
    };
}

export interface ApplePaySessionRequest {
    displayName: string;
    domainName: string;
    initiative: Initiative;
    merchantIdentifier: string;
}
