export default {
    environment: 'TEST',

    // isReadyToPayRequest
    existingPaymentMethodRequired: false,

    // ButtonOptions
    // https://developers.google.com/pay/api/web/reference/object#ButtonOptions
    buttonColor: 'default' as google.payments.api.ButtonColor, // default/black/white
    buttonType: 'long' as google.payments.api.ButtonType, // long/short
    buttonSizeMode: undefined,

    // PaymentDataRequest
    configuration: {
        // Adyen's merchant account
        gatewayMerchantId: '', // E.g TestMerchant

        // https://developers.google.com/pay/api/web/reference/object#MerchantInfo
        merchantId: '', // E.g 039484839309
        merchantName: '' // E.g Example Merchant,
    },

    // Payment
    amount: {
        value: 0,
        currency: 'USD'
    },

    totalPriceStatus: 'FINAL' as google.payments.api.TotalPriceStatus,

    // Callbacks
    onClick: resolve => resolve(),

    // CardParameters
    // https://developers.google.com/pay/api/web/reference/object#CardParameters
    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'] as google.payments.api.CardAuthMethod[],
    allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'] as google.payments.api.CardNetwork[],
    allowCreditCards: true, // Set to false if you don't support credit cards.
    allowPrepaidCards: true, // Set to false if you don't support prepaid cards.
    billingAddressRequired: false, // A billing address should only be requested if it's required to process the transaction.
    billingAddressParameters: undefined, // The expected fields returned if billingAddressRequired is set to true.
    assuranceDetailsRequired: false, // https://developers.google.com/pay/api/web/reference/response-objects#assurance-details-specifications

    emailRequired: false,
    shippingAddressRequired: false,
    shippingAddressParameters: undefined, // https://developers.google.com/pay/api/web/reference/object#ShippingAddressParameters
    shippingOptionRequired: false,
    shippingOptionParameters: undefined,
    paymentMethods: [],

    callbackIntents: []
};
