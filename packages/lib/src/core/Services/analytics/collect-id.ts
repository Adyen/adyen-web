import { HttpOptions, httpPost } from '../http';
import type { CollectIdEvent, CollectIdProps, TelemetryEvent } from './types';
import AdyenCheckoutError from '../../Errors/AdyenCheckoutError';
import { LIBRARY_BUNDLE_TYPE, LIBRARY_VERSION } from '../../config';

export const FAILURE_MSG =
    'WARNING: Failed to retrieve "checkoutAttemptId". Consequently, analytics will not be available for this payment. The payment process, however, will not be affected.';

/**
 * Send an event to Adyen with some basic telemetry info and receive a checkoutAttemptId in response
 * @param config - object containing values needed to calculate the url for the request; and also some that need to be serialized and included in the body of request
 * @returns a function returning a promise containing the response of the call (an object containing a checkoutAttemptId property)
 */
const collectId = ({ analyticsContext, clientKey, locale, analyticsPath }: CollectIdProps) => {
    let memoizedPromise: Promise<string> | null = null;

    const options: HttpOptions = {
        errorLevel: 'fatal' as const,
        loadingContext: analyticsContext,
        path: `${analyticsPath}?clientKey=${clientKey}`,
        errorMessage: FAILURE_MSG
    };

    return (event: CollectIdEvent): Promise<string> => {
        // Prevents multiple standalone components on the same page from making multiple calls to collect a checkoutAttemptId
        if (memoizedPromise !== null) {
            return memoizedPromise;
        }

        const telemetryEvent: TelemetryEvent = {
            version: LIBRARY_VERSION,
            buildType: LIBRARY_BUNDLE_TYPE,
            channel: 'Web',
            platform: 'Web',
            locale,
            referrer: window.location.href,
            screenWidth: window.screen.width,
            ...event
        };

        memoizedPromise = httpPost<{ checkoutAttemptId: string }>(options, telemetryEvent).then(conversion => {
            if (conversion?.checkoutAttemptId) {
                return conversion.checkoutAttemptId;
            }
            throw new AdyenCheckoutError('NETWORK_ERROR', 'Analytics: Attempt ID request was successfully but no ID was returned');
        });

        return memoizedPromise;
    };
};

export default collectId;
