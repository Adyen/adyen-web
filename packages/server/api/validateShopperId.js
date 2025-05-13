const makePostRequest = require('../utils/makePostRequest');
const handleCallback = require('../utils/handleCallback');
const { MERCHANT_ACCOUNT: merchantAccount } = require('../utils/config');

module.exports = async (res, request) => {
    const payload = {
        merchantAccount,
        paymentMethod: { ...request }
    };

    const response = await makePostRequest('validateShopperId', payload);
    handleCallback(response, res);
};
