import paymentMethodsConfig from './config/paymentMethodsConfig';
import paymentsConfig from './config/paymentsConfig';
import { httpPost } from './utils';

export const getPaymentMethods = configuration =>
    httpPost('paymentMethods', { ...paymentMethodsConfig, ...configuration })
        .then(response => {
            if (response.error) throw 'No paymentMethods available';
            return response;
        })
        .catch(console.error);

export const makePayment = (data, config = {}) => {
    // Needed for storedPMs in v70 if a standalone comp, or, in Dropin, advanced flow. (Sessions, v70, works with or without this prop)
    if (data.paymentMethod.storedPaymentMethodId) {
        config = { recurringProcessingModel: 'CardOnFile', ...config };
    }

    // NOTE: Merging data object. DO NOT do this in production.
    const paymentRequest = { ...paymentsConfig, ...config, ...data };
    if (paymentRequest.order) {
        delete paymentRequest.amount;
    }
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

export const createSession = data => {
    const payload = {
        ...data,
        lineItems: paymentsConfig.lineItems
    };
    return httpPost('sessions', payload)
        .then(response => {
            if (response.error) throw 'Session initiation failed';
            return response;
        })
        .catch(console.error);
};

export const getOriginKey = (originKeyOrigin = document.location.origin) =>
    httpPost('originKeys', { originDomains: [originKeyOrigin] }).then(response => response.originKeys[originKeyOrigin]);

export const checkBalance = data => {
    const payload = {
        ...data,
        amount: paymentMethodsConfig.amount
    };
    return httpPost('paymentMethods/balance', payload)
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

export const patchPaypalOrder = ({ sessionId, pspReference, paymentData, amount, deliveryMethods }) => {
    if (!(pspReference || sessionId) || !paymentData || !amount.value || !amount.currency) {
        throw Error('PayPal patching order - Field is missing');
    }
    return httpPost('paypal/updateOrder', {
        ...(sessionId && { sessionId }),
        ...(pspReference && { pspReference }),
        ...(deliveryMethods && { deliveryMethods }),
        paymentData,
        amount
    });
};
