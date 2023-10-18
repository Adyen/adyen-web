import { PaymentMethod, PaymentMethodsResponse, StoredPaymentMethod } from '../../../types';
import {
    filterAllowedPaymentMethods,
    filterEcomStoredPaymentMethods,
    filterRemovedPaymentMethods,
    filterSupportedStoredPaymentMethods
} from './filters';

const processStoredPaymentMethod = (pm): StoredPaymentMethod => ({
    ...pm,
    storedPaymentMethodId: pm.id,
    isStoredPaymentMethod: true
});

export const processPaymentMethods = (paymentMethods: PaymentMethod[], { allowPaymentMethods = [], removePaymentMethods = [] }): PaymentMethod[] => {
    if (!paymentMethods) return [];

    return paymentMethods.filter(filterAllowedPaymentMethods, allowPaymentMethods).filter(filterRemovedPaymentMethods, removePaymentMethods);
};

export const processStoredPaymentMethods = (
    storedPaymentMethods: StoredPaymentMethod[],
    { allowPaymentMethods = [], removePaymentMethods = [] }
): StoredPaymentMethod[] => {
    if (!storedPaymentMethods) return [];

    return storedPaymentMethods
        .filter(filterSupportedStoredPaymentMethods) // only display supported stored payment methods
        .filter(filterAllowedPaymentMethods, allowPaymentMethods)
        .filter(filterRemovedPaymentMethods, removePaymentMethods)
        .filter(filterEcomStoredPaymentMethods) // Only accept Ecommerce shopper interactions
        .map(processStoredPaymentMethod);
};

export const checkPaymentMethodsResponse = (paymentMethodsResponse: PaymentMethodsResponse) => {
    if (typeof paymentMethodsResponse === 'string') {
        throw new Error(
            'paymentMethodsResponse was provided but of an incorrect type (should be an object but a string was provided).' +
                'Try JSON.parse("{...}") your paymentMethodsResponse.'
        );
    }

    if (paymentMethodsResponse instanceof Array) {
        throw new Error(
            'paymentMethodsResponse was provided but of an incorrect type (should be an object but an array was provided).' +
                'Please check you are passing the whole response.'
        );
    }

    if (paymentMethodsResponse && !paymentMethodsResponse?.paymentMethods?.length && !paymentMethodsResponse?.storedPaymentMethods?.length) {
        console.warn('paymentMethodsResponse was provided but no payment methods were found.');
    }
};
