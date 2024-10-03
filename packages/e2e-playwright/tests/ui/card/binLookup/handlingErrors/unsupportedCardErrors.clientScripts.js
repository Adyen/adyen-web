/**
 * Set cartebancaire as a brand since the test dual brand card is visa/cb
 */
window.cardConfig = {
    type: 'scheme',
    brands: ['mc', 'visa', 'amex', 'cartebancaire'],
    onBinLookup: obj => {
        window.binLookupObj = obj;
    },
    onChange: state => {
        // Needed now that, for v5, we enhance the securedFields state.errors object with a rootNode prop
        // - Testcafe doesn't like a ClientFunction retrieving an object with a DOM node in it!?
        if (state.errors.encryptedCardNumber) {
            state.errors.encryptedCardNumber.rootNode = '';
        }

        window.errorObj = state.errors;
    }
};

window.dropinConfig = {
    showStoredPaymentMethods: false, // hide stored PMs so credit card is first on list
    paymentMethodsConfiguration: {
        card: { brands: ['mc', 'amex', 'visa', 'cartebancaire'], _disableClickToPay: true }
    }
};
