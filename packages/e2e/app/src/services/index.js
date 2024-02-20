import paymentMethodsConfig from './paymentMethodsConfig';
import paymentsConfig from './paymentsConfig';
import { httpPost } from '../utils/utils';

export const createSession = (data, config = {}) => {
    return httpPost('sessions', data)
        .then(response => {
            if (response.error) throw 'Session initiation failed';
            return response;
        })
        .catch(console.error);
};

export const getPaymentMethods = configuration =>
    httpPost('paymentMethods', { ...paymentMethodsConfig, ...configuration })
        .then(response => {
            if (response.error) throw 'No paymentMethods available';
            return response;
        })
        .catch(console.error);

export const makePayment = (data, config = {}) => {
    // NOTE: Merging data object. DO NOT do this in production.

    // Needed for storedPMs in v70 if a standalone comp, or, in Dropin, advanced flow. (Sessions, v70, works with or without this prop)
    if (data.paymentMethod.storedPaymentMethodId) {
        config = { recurringProcessingModel: 'CardOnFile', ...config };
    }

    const paymentRequest = { ...paymentsConfig, ...config, ...data };
    return httpPost('payments', paymentRequest)
        .then(response => {
            if (response.error) throw 'Payment initiation failed';
            return response;
        })
        .catch(console.error);
};

export const makeDetailsCall = data =>
    httpPost('details', data)
        .then(response => {
            if (response.error) throw 'Details call failed';
            return response;
        })
        .catch(err => console.error(err));

export const getOriginKey = (originKeyOrigin = document.location.origin) =>
    httpPost('originKeys', { originDomains: [originKeyOrigin] }).then(response => response.originKeys[originKeyOrigin]);

export const checkBalance = data => {
    return httpPost('paymentMethods/balance', data)
        .then(response => {
            if (response.error) throw 'Balance call failed';
            return response;
        })
        .catch(err => console.error(err));
};

export const createOrder = data => {
    const reference = `order-reference-${Date.now()}`;

    return httpPost('orders', { reference, ...data })
        .then(response => {
            if (response.error) throw 'Orders call failed';
            return response;
        })
        .catch(err => console.error(err));
};

export const cancelOrder = data => {
    return httpPost('orders/cancel', data)
        .then(response => {
            if (response.error) throw 'Orders call failed';
            return response;
        })
        .catch(err => console.error(err));
};
