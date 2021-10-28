window.cardConfig = {
    type: 'scheme',
    brands: ['mc', 'visa', 'amex'],
    minimumExpiryDate: '09/22'
    //    onChange: state => {
    //        // Needed now that, for v5, we enhance the securedFields state.errors object with a rootNode prop
    //        // - Testcafe doesn't like a ClientFunction retrieving an object with a DOM node in it!?
    //        if (!!Object.keys(state.errors).length) {
    //            // Replace any rootNode values in the objects in state.errors with an empty string
    //            const nuErrors = Object.entries(state.errors).reduce((acc, [fieldType, error]) => {
    //                acc[fieldType] = error ? { ...error, rootNode: '' } : error;
    //                return acc;
    //            }, {});
    //            window.mappedStateErrors = nuErrors;
    //        }
    //    }
};
