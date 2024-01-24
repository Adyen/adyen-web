window.dropinConfig = {
    showStoredPaymentMethods: false, // hide stored PMs so credit card is first on list
    paymentMethodsConfiguration: {
        card: {
            _disableClickToPay: true,
            challengeWindowSize: '04'
        }
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
    removePaymentMethods: ['paywithgoogle', 'applepay']
};
