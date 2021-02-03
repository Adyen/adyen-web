export const UNSUPPORTED_PAYMENT_METHODS = ['amazonpay', 'androidpay', 'samsungpay'];

// filter payment methods that we don't support in the Drop-in
export const filterUnsupported = paymentMethod => {
    console.log(paymentMethod);
    return !UNSUPPORTED_PAYMENT_METHODS.includes(paymentMethod.type);
};

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
