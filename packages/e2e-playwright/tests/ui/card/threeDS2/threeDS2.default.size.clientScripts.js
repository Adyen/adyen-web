window.dropinConfig = {
    showStoredPaymentMethods: false // hide stored PMs so credit card is first on list
};

window.mainConfiguration = {
    removePaymentMethods: ['paywithgoogle', 'applepay'],
    paymentMethodsConfiguration: {
        card: {
            _disableClickToPay: true
        }
    }
};
