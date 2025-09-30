import type { AddressData } from '../../types';
import type { UIElementProps } from '../internal/UIElement/types';

export interface GooglePayConfiguration extends UIElementProps {
    type?: 'googlepay' | 'paywithgoogle';

    /**
     * List of brands accepted by the component. Values are configured on the Backoffice and returned in the /paymentMethodsResponse data
     * @internal
     */
    brands?: string[];

    /**
     * Used for analytics
     */
    expressPage?: 'cart' | 'minicart' | 'pdp' | 'checkout';

    /**
     * Enables the GooglePay Express Flow & also used for analytics
     * @defaultValue false
     */
    isExpress?: boolean;

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
     */
    challengeWindowSize?: '01' | '02' | '03' | '04' | '05';

    /**
     * @see https://developers.google.com/pay/api/web/reference/request-objects#IsReadyToPayRequest
     * @defaultValue false
     */
    existingPaymentMethodRequired?: boolean;

    /**
     * The status of the total price
     * @see https://developers.google.com/pay/api/web/reference/request-objects#TransactionInfo
     */
    totalPriceStatus?: google.payments.api.TotalPriceStatus;

    /**
     * @see https://developers.google.com/pay/api/web/reference/request-objects#TransactionInfo
     */
    countryCode?: string;

    allowedAuthMethods?: google.payments.api.CardAuthMethod[];
    allowedCardNetworks?: google.payments.api.CardNetwork[];

    /**
     * Set to true to request assuranceDetails. This object provides information
     * about the validation performed on the returned payment data.
     *
     * @defaultValue false
     */
    assuranceDetailsRequired?: boolean;

    /**
     * Set to false if you don't support credit cards.
     * @defaultValue true
     */
    allowCreditCards?: boolean;

    /**
     * Set to false if you don't support prepaid cards.
     * @defaultValue true
     */
    allowPrepaidCards?: boolean;

    /**
     * Set to true if you require a billing address
     *
     * @remarks
     * A billing address should only be requested if it's required to process the transaction.
     *
     * @defaultValue false
     */
    billingAddressRequired?: boolean;

    /**
     * The expected fields returned if billingAddressRequired is set to true.
     */
    billingAddressParameters?: google.payments.api.BillingAddressParameters;

    /**
     * Set to true to request an email address.
     * @defaultValue false
     */
    emailRequired?: boolean;

    /**
     * Set to true to request a full shipping address.
     * @defaultValue false
     */
    shippingAddressRequired?: boolean;

    /**
     * If shippingAddressRequired is set to true, specify shipping address restrictions. This object is used to set shipping restrictions.
     *
     * @see https://developers.google.com/pay/api/web/reference/request-objects#ShippingAddressParameters
     */
    shippingAddressParameters?: google.payments.api.ShippingAddressParameters;

    /**
     * Set to true when the SHIPPING_OPTION callback intent is used. This field is required if you implement support
     * for Authorize Payments or Dynamic Price Updates.
     *
     * @see https://developers.google.com/pay/api/web/reference/request-objects#ShippingOptionParameters
     */
    shippingOptionRequired?: boolean;

    /**
     * @see https://developers.google.com/pay/api/web/reference/request-objects#ShippingOptionParameters
     */
    shippingOptionParameters?: google.payments.api.ShippingOptionParameters;

    /**
     * Specifies the following callback intents for PaymentDataCallbacks
     * @see https://developers.google.com/pay/api/web/reference/request-objects#PaymentDataCallbacks
     */
    callbackIntents?: google.payments.api.CallbackIntent[];

    /**
     * Disclaimer: 'onPaymentAuthorized' is not exposed as we are using our own method internally to
     * handle the authorization part
     *
     * @see https://developers.google.com/pay/api/web/reference/request-objects#PaymentDataCallbacks
     */
    paymentDataCallbacks?: Pick<google.payments.api.PaymentDataCallbacks, 'onPaymentDataChanged'>;

    /**
     * @see https://developers.google.com/pay/api/web/reference/request-objects#TransactionInfo
     */
    transactionInfo?: Partial<google.payments.api.TransactionInfo>;

    /**
     * Google button color
     * @default default
     */
    buttonColor?: google.payments.api.ButtonColor;
    /**
     * Changes the button UI label
     * @default buy
     */
    buttonType?: google.payments.api.ButtonType;

    /**
     * Decides if the button takes the whole space or use preset from Google
     * @default fill
     */
    buttonSizeMode?: google.payments.api.ButtonSizeMode;

    buttonRootNode?: HTMLDocument | ShadowRoot;
    buttonLocale?: string;
    buttonRadius?: number;

    /**
     * Called when the shopper clicks the Google Pay button. Call resolve() or reject() to continue or stop the payment flow.
     *
     * @param resolve - Display the Google payment sheet
     * @param reject - Don't display the Google payment sheet
     * @returns
     */
    onClick?: (resolve: () => void, reject: () => void) => void;

    /**
     * Callback called when GooglePay authorizes the payment.
     * Must be resolved/rejected with the action object.
     */
    onAuthorized?: (
        data: {
            authorizedEvent: google.payments.api.PaymentData;
            billingAddress?: Partial<AddressData>;
            deliveryAddress?: Partial<AddressData>;
        },
        actions: { resolve: () => void; reject: (error?: google.payments.api.PaymentDataError | string) => void }
    ) => void;

    configuration?: {
        /**
         * Adyen's merchant account name
         * @see https://developers.google.com/pay/api/web/reference/request-objects#gateway
         */
        gatewayMerchantId: string;

        /**
         * A Google merchant identifier issued after registration with the {@link https://pay.google.com/business/console | Google Pay Business Console}.
         * Required when PaymentsClient is initialized with an environment property of PRODUCTION.
         * @see https://developers.google.com/pay/api/web/reference/request-objects#MerchantInfo
         */
        merchantId?: string;

        /**
         * Merchant name is rendered in the payment sheet.
         * @see https://developers.google.com/pay/api/web/reference/request-objects#MerchantInfo
         */
        merchantName?: string;

        /**
         * Merchant fully qualified domain name.
         */
        merchantOrigin?: string;

        /**
         * Google JWT solution for platforms
         * To request Google Pay credentials, you can enable platforms to send requests that are authenticated with the platform credentials. You don't need to register individual domain names to call Google Pay APIs.
         */
        authJwt?: string;
    };
}

// Used to add undocumented google payment options
export interface GooglePaymentDataRequest extends google.payments.api.PaymentDataRequest {
    merchantInfo: ExtendedMerchantInfo;
}

export interface ExtendedMerchantInfo extends google.payments.api.MerchantInfo {
    merchantOrigin?: string;
}
