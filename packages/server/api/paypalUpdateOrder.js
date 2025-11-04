const makePostRequest = require('../utils/makePostRequest');
const handleCallback = require('../utils/handleCallback');

module.exports = async (res, request) => {
    const response = await makePostRequest('paypal/updateOrder', { ...request });
    handleCallback(response, res);
};
