import { PaymentMethod, PaymentMethodsResponseInterface } from '../../../types';

import {
    filterAllowedPaymentMethods,
    filterRemovedPaymentMethods,
    filterEcomStoredPaymentMethods,
    filterSupportedStoredPaymentMethods
} from './filters';

function processStoredPaymentMethod(pm): PaymentMethod {
    return {
        ...pm,
        storedPaymentMethodId: pm.id
    };
}

export const processPaymentMethods = (
    paymentMethodsResponse: PaymentMethodsResponseInterface,
    { allowPaymentMethods = [], removePaymentMethods = [] }
): PaymentMethod[] => {
    const { paymentMethods = [] } = paymentMethodsResponse;

    return paymentMethods.filter(filterAllowedPaymentMethods, allowPaymentMethods).filter(filterRemovedPaymentMethods, removePaymentMethods);
};

export const processStoredPaymentMethods = (
    paymentMethodsResponse: any = {},
    { allowPaymentMethods = [], removePaymentMethods = [] }
): PaymentMethod[] => {
    const { storedPaymentMethods = [] } = paymentMethodsResponse;

    return storedPaymentMethods
        .filter(filterSupportedStoredPaymentMethods) // only display supported stored payment methods
        .filter(filterAllowedPaymentMethods, allowPaymentMethods)
        .filter(filterRemovedPaymentMethods, removePaymentMethods)
        .filter(filterEcomStoredPaymentMethods) // Only accept Ecommerce shopper interactions
        .map(processStoredPaymentMethod);
};

class PaymentMethodsResponse {
    public paymentMethods: PaymentMethod[] = [];
    public storedPaymentMethods: PaymentMethod[] = [];

    constructor(response, options = {}) {
        if (typeof response === 'string') {
            throw new Error(
                `paymentMethodsResponse was provided but of an incorrect type (should be an object but a string was provided).
                Try JSON.parse("{...}") your paymentMethodsResponse.`
            );
        }

        this.paymentMethods = response ? processPaymentMethods(response, options) : [];
        this.storedPaymentMethods = response ? processStoredPaymentMethods(response, options) : [];
    }

    has(paymentMethod: string): boolean {
        return Boolean(this.paymentMethods.find(pm => pm.type === paymentMethod));
    }

    find(paymentMethod: string): PaymentMethod {
        return this.paymentMethods.find(pm => pm.type === paymentMethod);
    }
}

export default PaymentMethodsResponse;
