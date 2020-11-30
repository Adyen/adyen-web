/**
 * Set cartebancaire as a brand since the test dual brand card is visa/cb
 */
window.cardConfig = {
    type: 'scheme',
    brands: ['mc', 'visa', 'amex', 'cartebancaire']
};

window.dropinConfig = {
    showStoredPaymentMethods: false, // hide stored PMs so credit card is first on list
    paymentMethodsConfiguration: {
        card: { brands: ['mc', 'amex', 'visa', 'cartebancaire'] }
    }
};

/**
 * Seems to be an error with TestCafe
 * Throws:
 *  JavaScript error details:
 *  ReferenceError: PaymentRequest is not defined
 *    at https://pay.google.com/gp/p/js/pay.js:237:404
 */
window.mainConfiguration = {
    removePaymentMethods: ['paywithgoogle']
};
