import { RawPaymentMethod, PaymentMethodsResponse, RawStoredPaymentMethod } from '../../../types/global-types';
import {
    filterAllowedPaymentMethods,
    filterEcomStoredPaymentMethods,
    filterRemovedPaymentMethods,
    filterSupportedStoredPaymentMethods
} from './filters';
import uuidv4 from '../../../utils/uuid';
import type { PaymentMethod, StoredPaymentMethod } from './PaymentMethods';

/**
 * Finds the fundingSource for a stored payment method by matching its brand
 * against the available payment methods.
 */
function getFundingSourceForStoredCard(
    storedPaymentMethod: RawStoredPaymentMethod,
    paymentMethods: RawPaymentMethod[]
): RawPaymentMethod['fundingSource'] {
    if (storedPaymentMethod.type !== 'scheme') {
        return undefined;
    }

    const storedBrand = storedPaymentMethod.brand;
    if (!storedBrand) {
        return undefined;
    }

    const matchingPaymentMethod = paymentMethods.find(pm => pm.type === 'scheme' && pm.brands?.includes(storedBrand));

    return matchingPaymentMethod?.fundingSource;
}

const processStoredPaymentMethod = (storedPM: RawStoredPaymentMethod, paymentMethods: RawPaymentMethod[]): StoredPaymentMethod => {
    const fundingSource = getFundingSourceForStoredCard(storedPM, paymentMethods);
    return {
        ...storedPM,
        storedPaymentMethodId: storedPM.id,
        isStoredPaymentMethod: true,
        ...(fundingSource && { fundingSource })
    };
};

/**
 * Generate unique ID per payment method. Useful to fetch the correct payment method properties from the response
 * @param paymentMethod
 */
function generatePaymentMethodId(paymentMethod: RawPaymentMethod): PaymentMethod {
    return {
        ...paymentMethod,
        _id: uuidv4()
    };
}

export const processPaymentMethods = (
    paymentMethods: RawPaymentMethod[],
    { allowPaymentMethods = [], removePaymentMethods = [] }
): PaymentMethod[] => {
    if (!paymentMethods) return [];

    return paymentMethods
        .filter(filterAllowedPaymentMethods, allowPaymentMethods)
        .filter(filterRemovedPaymentMethods, removePaymentMethods)
        .map(generatePaymentMethodId);
};

export const processStoredPaymentMethods = (
    storedPaymentMethods: RawStoredPaymentMethod[],
    { allowPaymentMethods = [], removePaymentMethods = [] },
    paymentMethods: RawPaymentMethod[] = []
): StoredPaymentMethod[] => {
    if (!storedPaymentMethods) return [];

    return storedPaymentMethods
        .filter(filterSupportedStoredPaymentMethods) // only display supported stored payment methods
        .filter(filterAllowedPaymentMethods, allowPaymentMethods)
        .filter(filterRemovedPaymentMethods, removePaymentMethods)
        .filter(filterEcomStoredPaymentMethods) // Only accept Ecommerce shopper interactions
        .map(storedPM => processStoredPaymentMethod(storedPM, paymentMethods));
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
