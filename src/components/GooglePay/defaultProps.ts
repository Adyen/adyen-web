export default {
    environment: 'TEST',

    // isReadyToPayRequest
    existingPaymentMethodRequired: true,

    // ButtonOptions
    // https://developers.google.com/pay/api/web/reference/object#ButtonOptions
    buttonColor: 'default', // default/black/white
    buttonType: 'long', // long/short
    showPayButton: true, // show or hide the Google Pay button

    // PaymentDataRequest
    configuration: {
        // Adyen's merchant account
        gatewayMerchantId: '', // E.g TestMerchant

        // https://developers.google.com/pay/api/web/reference/object#MerchantInfo
        merchantIdentifier: '', // E.g 039484839309
        merchantName: '' // E.g Example Merchant
    },

    // Payment
    amount: {
        value: 0,
        currency: 'USD'
    },

    countryCode: 'US',
    totalPriceStatus: 'FINAL',

    // Callbacks
    onError: () => {},
    onAuthorized: params => params,
    onSubmit: () => {},

    // CardParameters
    // https://developers.google.com/pay/api/web/reference/object#CardParameters
    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
    allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'],
    allowCreditCards: true, // Set to false if you don't support credit cards.
    allowPrepaidCards: true, // Set to false if you don't support prepaid cards.
    billingAddressRequired: false, // A billing address should only be requested if it's required to process the transaction.
    billingAddressParameters: {}, // The expected fields returned if billingAddressRequired is set to true.

    emailRequired: false,
    shippingAddressRequired: false,
    shippingAddressParameters: {}, // https://developers.google.com/pay/api/web/reference/object#ShippingAddressParameters
    shippingOptionRequired: false,
    shippingOptionParameters: undefined
};
