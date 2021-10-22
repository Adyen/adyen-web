window.cardConfig = {
    type: 'scheme',
    brands: ['mc', 'visa', 'amex'],
    minimumExpiryDate: '09/22',
    onChange: state => {
        // Needed now that, for v5, we enhance the securedFields state.errors object with a rootNode prop
        // - Testcafe doesn't like a ClientFunction retrieving an object with a DOM node in it!?
        // TODO - do in more dynamic way
        if (state.errors.encryptedCardNumber) {
            state.errors.encryptedCardNumber.rootNode = '';
        }
        if (state.errors.encryptedExpiryDate) {
            state.errors.encryptedExpiryDate.rootNode = '';
        }
        if (state.errors.encryptedSecurityCode) {
            state.errors.encryptedSecurityCode.rootNode = '';
        }

        window.mappedStateErrors = state.errors;
    }
};
