import { ApplePayElementProps } from '~/components/ApplePay/types';

const defaultProps: ApplePayElementProps = {
    version: 3,

    // Transaction Information
    amount: { currency: 'USD', value: 0 },

    /**
     * The merchant’s two-letter ISO 3166 country code.
     */
    countryCode: 'US',

    totalPriceStatus: 'final',
    totalPriceLabel: '',

    configuration: {
        merchantName: '',
        merchantIdentifier: ''
    },

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

    onSubmit: () => {},
    onError: () => {},
    onAuthorized: resolve => resolve(),
    onValidateMerchant: (resolve, reject) => reject('onValidateMerchant event not implemented'),

    /**
     * https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession/1778013-onpaymentmethodselected
     * @param resolve(ApplePayPaymentMethodUpdate update) Completes the selection of a payment method with an update.
     * @param reject() Completes the selection of a payment method with no update.
     * @param event The event parameter contains the paymentMethod attribute.
     */
    onPaymentMethodSelected: null,

    /**
     * https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession/1778009-onshippingcontactselected
     * @param resolve(ApplePayShippingContactUpdate update) Completes the selection of a shipping contact with an update.
     * @param reject() Completes the selection of a shipping contact with no update.
     * @param event The event parameter contains the shippingContact attribute.
     */
    onShippingContactSelected: null,

    /**
     * https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession/1778028-onshippingmethodselected
     * @param resolve(ApplePayShippingMethodUpdate update) Completes the selection of a shipping method with an update.
     * @param reject() Completes the selection of a shipping method with no update.
     * @param event The event parameter contains the shippingMethod attribute.
     */
    onShippingMethodSelected: null,

    // ButtonOptions
    buttonType: 'plain',
    buttonColor: 'black',
    showPayButton: true // show or hide the Apple Pay button
};

export default defaultProps;
