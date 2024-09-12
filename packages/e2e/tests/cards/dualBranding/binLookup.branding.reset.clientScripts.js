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
        card: { brands: ['mc', 'amex', 'visa', 'cartebancaire', 'bcmc', 'maestro'], _disableClickToPay: true }
    }
};

window.mainConfiguration = {
    removePaymentMethods: ['paywithgoogle', 'applepay', 'clicktopay']
};
