export const UNSUPPORTED_PAYMENT_METHODS = ['androidpay', 'samsungpay', 'clicktopay'];

// filter payment methods that we don't support in the Drop-in
export const filterUnsupported = paymentMethod => !UNSUPPORTED_PAYMENT_METHODS.includes(paymentMethod.constructor['type']);

// filter payment methods that we support (that are in the paymentMethods/index dictionary)
export const filterPresent = paymentMethod => !!paymentMethod;

// filter payment methods that are available to the user
export const filterAvailable = paymentMethod => {
    if (paymentMethod.isAvailable) {
        const timeout = new Promise((resolve, reject) => setTimeout(reject, 5000));
        return Promise.race([paymentMethod.isAvailable(), timeout]);
    }

    return Promise.resolve(!!paymentMethod);
};
