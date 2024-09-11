const makePostRequest = require('../utils/getPostParameters');
const handleCallback = require('../utils/handleCallback');
const { MERCHANT_ACCOUNT: merchantAccount } = require('../utils/config');

module.exports = async (res, request) => {
    const response = await makePostRequest('orders/cancel', { merchantAccount, ...request });
    handleCallback(response, res);
};
