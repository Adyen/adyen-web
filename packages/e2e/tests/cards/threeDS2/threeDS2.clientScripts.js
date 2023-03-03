window.dropinConfig = {
    showStoredPaymentMethods: false // hide stored PMs so credit card is first on list
};

/**
 * Seems to be an error with TestCafe
 * Throws:
 *  JavaScript error details:
 *  ReferenceError: PaymentRequest is not defined
 *    at https://pay.google.com/gp/p/js/pay.js:237:404
 */
window.mainConfiguration = {
    removePaymentMethods: ['paywithgoogle', 'applepay'],
    paymentMethodsConfiguration: {
        threeDS2: {
            challengeWindowSize: '04'
        },
        card: {
            _disableClickToPay: true
        }
    }
};
