window.dropinConfig = {
    showStoredPaymentMethods: false // hide stored PMs
};

window.mainConfiguration = {
    removePaymentMethods: ['paywithgoogle', 'applepay'],
    paymentMethodsConfiguration: {
        card: {
            _disableClickToPay: true
        }
    }
};
