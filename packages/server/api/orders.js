const makePostRequest = require('../utils/makePostRequest');
const handleCallback = require('../utils/handleCallback');
const { MERCHANT_ACCOUNT: merchantAccount } = require('../utils/config');

module.exports = async (res, request) => {
    const response = await makePostRequest('orders', { merchantAccount, ...request });
    handleCallback(response, res);
};
