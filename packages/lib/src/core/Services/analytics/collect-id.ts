import { httpPost } from '../http';
import Storage from '../../../utils/Storage';
import { CheckoutAttemptIdSession, CollectIdProps, TelemetryEvent } from './types';

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
const collectId = ({ analyticsContext, clientKey, locale }: CollectIdProps) => {
    let promise;

    const options = {
        errorLevel: 'silent' as const,
        loadingContext: analyticsContext,
        path: `v2/analytics?clientKey=${clientKey}`
    };

    return (event): Promise<string> => {
        const telemetryEvent: TelemetryEvent = {
            // amount,  // TODO will be supported in the future
            version: process.env.VERSION,
            channel: 'Web',
            locale,
            referrer: window.location.href,
            screenWidth: window.screen.width,
            ...event
        };

        if (promise) return promise;
        if (!clientKey) return Promise.reject();

        const storage = new Storage<CheckoutAttemptIdSession>('checkout-attempt-id', 'sessionStorage');
        const checkoutAttemptIdSession = storage.get();

        // In some cases, e.g. where the merchant has redirected the shopper and then returned them to checkout, we still have a valid checkoutAttemptId
        // so there is no need for the re-initialised Checkout to generate another one
        if (confirmSessionDurationIsMaxFifteenMinutes(checkoutAttemptIdSession)) {
            return Promise.resolve(checkoutAttemptIdSession.id);
        }

        promise = httpPost(options, telemetryEvent)
            .then(conversion => {
                if (conversion.id) {
                    storage.set({ id: conversion.id, timestamp: Date.now() });
                    return conversion.id;
                }
                return undefined;
            })
            .catch(() => {
                // TODO - temporarily faking it - so we get a checkoutAttemptId which will allow subsequents request to be made (they'll fail, but at least we see them in the console)
                console.log('### collect-id2:::: FAILED');
                const id = '64d673ff-36d3-4b32-999b-49e215f6b9891687261360764E7D99B01E11BF4C4B83CF7C7F49C5E75F23B2381E2ACBEE8E03E221E3BC95998';
                storage.set({ id: id, timestamp: Date.now() });
                return id;
                // TODO - end
            });
        // .catch(() => {});

        return promise;
    };
};

export default collectId;
