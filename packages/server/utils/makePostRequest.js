const { CHECKOUT_API_KEY, CHECKOUT_URL } = require('./config');

module.exports = (endpoint, request) => {
    const body = JSON.stringify(request);

    return fetch(`${CHECKOUT_URL}/${endpoint}`, {
        method: 'POST',
        body,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body, 'utf8'), // Content length in bytes
            'X-Api-Key': CHECKOUT_API_KEY // API key added to headers
        }
    });
};
