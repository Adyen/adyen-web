import { UIElementProps } from '../UIElement';

export interface GooglePayPropsConfiguration {
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

    // Kept for legacy reasons
    merchantIdentifier?: string;

    /**
     * Merchant name is rendered in the payment sheet.
     * @see https://developers.google.com/pay/api/web/reference/request-objects#MerchantInfo
     */
    merchantName?: string;
}

export interface GooglePayProps extends UIElementProps {
    environment?: google.payments.api.Environment | string;
    configuration?: GooglePayPropsConfiguration;

    /**
     * @see https://developers.google.com/pay/api/web/reference/request-objects#IsReadyToPayRequest
     * @defaultValue true
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
     * @see https://developers.google.com/pay/api/web/reference/request-objects#ShippingOptionParameters
     */
    shippingAddressParameters?: google.payments.api.ShippingAddressParameters;

    /**
     * Set to true when the SHIPPING_OPTION callback intent is used.
     * @see https://developers.google.com/pay/api/web/reference/request-objects#ShippingOptionParameters
     */
    shippingOptionRequired?: boolean;

    /**
     * @see https://developers.google.com/pay/api/web/reference/request-objects#ShippingOptionParameters
     */
    shippingOptionParameters?: google.payments.api.ShippingOptionParameters;

    callbackIntents?: google.payments.api.CallbackIntent[];

    /**
     * @see https://developers.google.com/pay/api/web/reference/request-objects#PaymentDataCallbacks
     */
    paymentDataCallbacks?: google.payments.api.PaymentDataCallbacks;

    /**
     * @see https://developers.google.com/pay/api/web/reference/request-objects#TransactionInfo
     */
    transactionInfo?: Partial<google.payments.api.TransactionInfo>;

    // Button

    /**
     * @deprecated use showPayButton
     */
    showButton?: boolean;
    buttonColor?: google.payments.api.ButtonColor;
    buttonType?: google.payments.api.ButtonType;

    // Events
    onClick?: (resolve, reject) => void;
    onAuthorized?: (paymentData: google.payments.api.PaymentData) => void;
}
