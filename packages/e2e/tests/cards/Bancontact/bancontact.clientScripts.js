window.dropinConfig = {
    showStoredPaymentMethods: false // hide stored PMs
};

window.mainConfiguration = {
    removePaymentMethods: ['paywithgoogle', 'applepay'],
    allowPaymentMethods: ['bcmc'],
    paymentMethodsConfiguration: {
        bcmc: {
            _disableClickToPay: true
        }
    }
};
