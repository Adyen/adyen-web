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
