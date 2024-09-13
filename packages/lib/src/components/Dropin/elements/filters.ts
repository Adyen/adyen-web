import promiseTimeout from '../../../utils/promiseTimeout';
import type { PaymentMethod, StoredPaymentMethod, UIElement } from '../../../types';

export const UNSUPPORTED_PAYMENT_METHODS = ['androidpay', 'samsungpay', 'clicktopay'];

/**
 * Filter out payment methods that are not supported by Drop-in
 * @param paymentMethod - Payment method object from /paymentMethods response
 */
export const filterUnsupportedPaymentMethod = (paymentMethod: PaymentMethod | StoredPaymentMethod) =>
    !UNSUPPORTED_PAYMENT_METHODS.includes(paymentMethod.type);

// filter payment methods that we support (that are in the paymentMethods/index dictionary)
export const filterPresent = paymentMethod => !!paymentMethod;

// filter payment methods that are available to the user
export const filterAvailable = (elements: UIElement[]) => {
    const elementIsAvailablePromises = elements.map(element => {
        const { promise } = promiseTimeout(5000, element.isAvailable(), {});
        return promise;
    });

    return Promise.allSettled(elementIsAvailablePromises).then(promiseResults => {
        return elements.filter((element, i) => promiseResults[i].status === 'fulfilled');
    });
};

export const optionallyFilterUpiSubTxVariants = (paymentMethods: Array<PaymentMethod | StoredPaymentMethod>) => {
    const hasUpiParent = paymentMethods.some(pm => pm?.type === 'upi');
    // If we don't get the 'upi' parent, we render multiple upi components
    if (!hasUpiParent) return paymentMethods;

    // If we get the 'upi' parent, we remove upi sub tx_variant components
    const UPI_SUB_TX_VARIANTS = ['upi_qr', 'upi_collect', 'upi_intent'];
    return paymentMethods.filter(pm => !UPI_SUB_TX_VARIANTS.includes(pm?.type));
};
