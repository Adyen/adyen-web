import { httpPost } from '../http';
import Storage from '../../../utils/Storage';
import { CheckoutAttemptIdSession, CollectIdProps } from './types';

/**
 * If the checkout attempt ID was stored more than fifteen minutes ago, then we should request a new ID.
 * More here: COWEB-1099
 */
function confirmSessionDurationIsMaxFifteenMinutes(checkoutAttemptIdSession: CheckoutAttemptIdSession): boolean {
    if (!checkoutAttemptIdSession?.id) return false;

    const fifteenMinInMs = 1000 * 60 * 15;
    const fifteenMinAgoTimestamp = Date.now() - fifteenMinInMs;
    return checkoutAttemptIdSession.timestamp > fifteenMinAgoTimestamp;
}

/**
 * Log event to Adyen
 * @param config - ready to be serialized and included in the body of request
 * @returns a function returning a promise containing the response of the call
 */
const collectId = ({ loadingContext, clientKey, experiments }: CollectIdProps) => {
    let promise;

    const options = {
        errorLevel: 'silent' as const,
        loadingContext: loadingContext,
        path: `v2/analytics/id?clientKey=${clientKey}`
    };

    return (): Promise<string> => {
        if (promise) return promise;
        if (!clientKey) return Promise.reject();

        const storage = new Storage<CheckoutAttemptIdSession>('checkout-attempt-id', window.sessionStorage);
        const checkoutAttemptIdSession = storage.get();

        if (confirmSessionDurationIsMaxFifteenMinutes(checkoutAttemptIdSession)) {
            return Promise.resolve(checkoutAttemptIdSession.id);
        }

        promise = httpPost(options, { experiments })
            .then(conversion => {
                if (conversion.id) {
                    storage.set({ id: conversion.id, timestamp: Date.now() });
                    return conversion.id;
                }
                return undefined;
            })
            .catch(() => {});

        return promise;
    };
};

export default collectId;
