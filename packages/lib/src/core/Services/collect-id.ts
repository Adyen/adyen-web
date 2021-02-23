import { httpPost } from './http';

/**
 * Log event to Adyen
 * @param config - ready to be serialized and included in the body of request
 * @returns a function returning a promise containing the response of the call
 */
const collectId = ({ loadingContext, clientKey }) => {
    let promise;

    const options = {
        errorLevel: 'silent' as const,
        loadingContext: loadingContext,
        path: `v1/analytics/id?clientKey=${clientKey}`
    };

    return () => {
        if (promise) return promise;
        if (!clientKey) return Promise.reject();

        promise = httpPost(options)
            .then(conversion => conversion?.id)
            .catch(() => {});

        return promise;
    };
};

export default collectId;
