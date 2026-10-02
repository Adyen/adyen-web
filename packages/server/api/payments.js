const makePostRequest = require('../utils/makePostRequest');
const handleCallback = require('../utils/handleCallback');
const unwrapGluepage = require('../utils/unwrapGluepage');
const { MERCHANT_ACCOUNT: merchantAccount } = require('../utils/config');

// TEMPORARY - Klarna Network POC: replace the Adyen gluepage URL with the direct Klarna Payment Request URL
const sendKlarnaNetworkResponse = async (response, res) => {
    if (!response.ok) return handleCallback(response, res);

    const body = await response.json();

    if (body.action?.url) {
        try {
            body.action.url = await unwrapGluepage(body.action.url);
        } catch (error) {
            console.error('KlarnaNetwork POC: failed to unwrap gluepage URL, returning original response', error);
        }
    }

    res.send(body);
};

module.exports = async (res, request) => {
    const response = await makePostRequest('/payments', { merchantAccount, ...request });

    if (request.paymentMethod?.type === 'klarna_network') return sendKlarnaNetworkResponse(response, res);

    handleCallback(response, res);
};
