/**
 * Submits data to Adyen
 * @param {string} initiationUrl Url where to make the callbacks
 * @param {object} data ready to be serialized and included in the body of request
 * @return {Promise} a promise containing the response of the call
 */
const submitData = (initiationUrl, data) => {
    const options = {
        method: 'POST',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    return fetch(initiationUrl, options)
        .then(response => response.json())
        .then(response => {
            if (response.type && response.type === 'error') {
                throw response;
            }
            return response;
        })
        .catch(error => {
            console.error(error);
            throw new Error('error.message.unknown');
        });
};

export default submitData;
