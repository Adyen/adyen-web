import { httpPost } from '../http';
import Storage from '../../../utils/Storage';
import { CheckoutAttemptIdSession, CollectIdProps, TelemetryEvent } from './types';

export const FAILURE_MSG =
    'WARNING: Failed to retrieve "checkoutAttemptId". Consequently, analytics will not be available for this payment. The payment process, however, will not be affected.';

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
 * Send an event to Adyen with some basic telemetry info and receive a checkoutAttemptId in response
 * @param config - object containing values needed to calculate the url for the request; and also some that need to be serialized and included in the body of request
 * @returns a function returning a promise containing the response of the call (an object containing a checkoutAttemptId property)
 */
// const collectId = ({ analyticsContext, clientKey, locale, amount }: CollectIdProps) => { // TODO - amount will be supported in the future
const collectId = ({ analyticsContext, clientKey, locale, analyticsPath }: CollectIdProps) => {
    let promise;

    const options = {
        errorLevel: 'fatal' as const, // ensure our catch block is called
        loadingContext: analyticsContext,
        path: `${analyticsPath}?clientKey=${clientKey}`
    };

    return (event): Promise<string> => {
        const telemetryEvent: TelemetryEvent = {
            // amount,  // TODO will be supported in the future
            version: process.env.VERSION,
            // The data team want both platform & channel properties:
            channel: 'Web',
            platform: 'Web',
            buildType: window['AdyenWeb'] ? 'umd' : 'compiled',
            locale,
            referrer: window.location.href,
            screenWidth: window.screen.width,
            ...event
        };

        if (promise) return promise; // Prevents multiple standalone components on the same page from making multiple calls to collect a checkoutAttemptId
        if (!clientKey) return Promise.reject('no-client-key');

        const storage = new Storage<CheckoutAttemptIdSession>('checkout-attempt-id', 'sessionStorage');
        const checkoutAttemptIdSession = storage.get();

        // In some cases, e.g. where the merchant has redirected the shopper and then returned them to checkout, we still have a valid checkoutAttemptId
        // so there is no need for the re-initialised Checkout to generate another one
        if (confirmSessionDurationIsMaxFifteenMinutes(checkoutAttemptIdSession)) {
            return Promise.resolve(checkoutAttemptIdSession.id);
        }

        promise = httpPost(options, telemetryEvent)
            .then(conversion => {
                if (conversion?.checkoutAttemptId) {
                    storage.set({ id: conversion.checkoutAttemptId, timestamp: Date.now() });
                    return conversion.checkoutAttemptId;
                }
                return undefined;
            })
            .catch(() => {
                console.debug(FAILURE_MSG);
                return FAILURE_MSG;
            });

        return promise;
    };
};

export default collectId;
