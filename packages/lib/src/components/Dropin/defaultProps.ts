export default {
    instantPaymentTypes: [],

    isDropin: true,
    onReady: () => {}, // triggered when the Dropin is fully loaded
    onComplete: () => {}, // triggered when the shopper completes a payment
    onError: () => {}, // triggered when an error occurs (for example, could not submit a payment)
    onSelect: () => {}, // triggered when a paymentMethod is selected
    onDisableStoredPaymentMethod: null, // triggered when a shopper removes a storedPaymentMethod
    onChange: () => {},

    amount: {},
    paymentMethodsConfiguration: {}, // per paymentMethod configuration
    openFirstPaymentMethod: true, // focus the first payment method automatically on load
    openFirstStoredPaymentMethod: true, // focus the first one click payment method automatically on load
    showStoredPaymentMethods: true, // shows/hides oneclick paymentMethods
    showPaymentMethods: true, // shows/hides regular paymentMethods
    showRemoveStoredPaymentMethodButton: false
};
