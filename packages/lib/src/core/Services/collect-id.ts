/**
 * Log event to Adyen
 * @param config - ready to be serialized and included in the body of request
 * @returns a promise containing the response of the call
 */
import fetchJsonData from './fetch-json-data';

const collectId = config => {
    if (!config.clientKey) return Promise.reject();

    const options = {
        clientKey: config.clientKey,
        errorLevel: 'silent' as const,
        loadingContext: config.loadingContext,
        method: 'POST',
        path: 'v1/analytics/id'
    };

    return fetchJsonData(options).then(conversion => conversion.id);
};

export default collectId;
