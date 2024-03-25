const defaultProps = {
    // Transaction Information
    amount: { currency: 'USD', value: 0 },

    /**
     * The merchant’s two-letter ISO 3166 country code.
     */
    countryCode: 'US',

    totalPriceStatus: 'final',
    totalPriceLabel: undefined,

    configuration: {
        merchantName: '',
        merchantId: ''
    },

    initiative: 'web',

    isExpress: false,

    /**
     * https://developer.apple.com/documentation/apple_pay_on_the_web/applepaypaymentrequest/1916120-lineitems
     * A set of line items that explain recurring payments and additional charges and discounts.
     */
    lineItems: undefined,

    /**
     * https://developer.apple.com/documentation/apple_pay_on_the_web/applepaypaymentrequest/1916123-merchantcapabilities
     * The payment capabilities supported by the merchant.
     */
    merchantCapabilities: ['supports3DS'],

    /**
     * https://developer.apple.com/documentation/apple_pay_on_the_web/applepaypaymentrequest/1916121-shippingmethods
     * A list of available methods for shipping physical goods.
     */
    shippingMethods: undefined,

    /**
     * https://developer.apple.com/documentation/apple_pay_on_the_web/applepaypaymentrequest/1916128-shippingtype
     * An optional value that indicates how purchased items are to be shipped.
     */
    shippingType: undefined,

    /**
     * https://developer.apple.com/documentation/apple_pay_on_the_web/applepaypaymentrequest/2928612-supportedcountries
     * A list of two-character country codes you provide, used to limit payments to cards from specific countries.
     */
    supportedCountries: undefined,

    /**
     * https://developer.apple.com/documentation/apple_pay_on_the_web/applepaypaymentrequest/1916122-supportednetworks
     * The payment networks supported by the merchant.
     */
    supportedNetworks: ['amex', 'discover', 'masterCard', 'visa'],

    // Requested Billing and Shipping Contact Information

    /**
     * The fields of billing information that you require from the user to process the transaction.
     */
    requiredBillingContactFields: undefined,

    /**
     * The fields of shipping information that you require from the user to fulfill the order.
     */
    requiredShippingContactFields: undefined,

    // Known Contact Information

    billingContact: undefined, // Billing contact information for the user.
    shippingContact: undefined, // Shipping contact information for the user.

    // Custom Data

    applicationData: undefined, // A Base64-encoded string used to contain your application-specific data.

    // Events
    onClick: resolve => resolve(),
    onAuthorized: resolve => resolve(),
    onPaymentMethodSelected: null,
    onShippingContactSelected: null,
    onShippingMethodSelected: null,

    // ButtonOptions
    buttonType: 'plain',
    buttonColor: 'black',
    showPayButton: true // show or hide the Apple Pay button
};

export default defaultProps;
