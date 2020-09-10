const { CHECKOUT_API_KEY, CHECKOUT_URL } = require('./config');

module.exports = (endpoint, request) => {
    const body = JSON.stringify(request);

    return {
        body,
        url: `${CHECKOUT_URL}/${endpoint}`,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body, 'utf8'),
            'X-Api-Key': CHECKOUT_API_KEY
        }
    };
};
