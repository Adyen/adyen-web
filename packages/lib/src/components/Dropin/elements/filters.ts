import { PaymentMethod } from '../../../types';

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

export const optionallyFilterUpiSubTxVariants = (paymentMethods: Array<PaymentMethod>) => {
    const hasUpiParent = paymentMethods.some(pm => pm.type === 'upi');
    // If we don't get the 'upi' parent, we render multiple upi components
    if (!hasUpiParent) return paymentMethods;

    // If we get the 'upi' parent, we remove upi sub tx_variant components
    const UPI_SUB_TX_VARIANTS = ['upi_qr', 'upi_collect', 'upi_intent'];
    return paymentMethods.filter(pm => !UPI_SUB_TX_VARIANTS.includes(pm.type));
};
