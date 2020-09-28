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
    // NOTE: Merging data object. DO NOT do this in production.
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
            if (response.error) {
                throw 'Details call failed';
            }
            return response;
        })
        .catch(err => console.error(err));

export const getOriginKey = (originKeyOrigin = document.location.origin) =>
    httpPost('originKeys', { originDomains: [originKeyOrigin] }).then(response => response.originKeys[originKeyOrigin]);

export const checkBalance = data => {
    return httpPost('paymentMethods/balance', data)
        .then(response => {
            if (response.error) {
                throw 'Balance call failed';
            }
            return response;
        })
        .catch(err => console.error(err));
};
