/**
 * Log event to Adyen
 * @param {object} config ready to be serialized and included in the body of request
 * @return {Promise} a promise containing the response of the call
 */
const collectId = config => {
    const options = {
        method: 'POST',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    };
    const accessKey = config.clientKey ? config.clientKey : config.originKey;
    return fetch(`${config.loadingContext}v1/analytics/id?token=${accessKey}`, options)
        .then(response => {
            if (response.ok) return response.json();
            throw new Error('Collect ID not available');
        })
        .then(conversion => conversion.id)
        .catch(() => {});
};

export default collectId;
