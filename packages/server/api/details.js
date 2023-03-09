const { post } = require('request');
const getPostParameters = require('../utils/getPostParameters');
const handleCallback = require('../utils/handleCallback');
const { MERCHANT_ACCOUNT: merchantAccount } = require('../utils/config');

module.exports = (res, request) => {
    const params = getPostParameters('/payments/details', { merchantAccount, ...request });
    post(params, (err, response, body) => handleCallback({ err, response, body }, res));
};
