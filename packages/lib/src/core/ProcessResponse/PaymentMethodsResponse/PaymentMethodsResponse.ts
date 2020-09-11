import { PaymentMethod, PaymentMethodsResponseInterface } from '../../../types';
import { ERROR_CODES, ERROR_MSG_INCORRECT_PMR } from '../../Errors/constants';

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
            // TODO fix [] access with TS
            options['onError']({ error: ERROR_CODES[ERROR_MSG_INCORRECT_PMR] });
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
