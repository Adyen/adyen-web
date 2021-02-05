import { httpPost } from './http';

/**
 * Log event to Adyen
 * @param config - ready to be serialized and included in the body of request
 * @returns a promise containing the response of the call
 */
const collectId = config => {
    if (!config.clientKey) return Promise.reject();

    const options = {
        errorLevel: 'silent' as const,
        loadingContext: config.loadingContext,
        path: `v1/analytics/id?clientKey=${config.clientKey}`
    };

    return httpPost(options).then(conversion => conversion.id);
};

export default collectId;
