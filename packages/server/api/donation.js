const { post } = require('request');
const getPostParameters = require('../utils/getPostParameters');
const handleCallback = require('../utils/handleCallback');
const { MERCHANT_ACCOUNT: merchantAccount } = require('../utils/config');

module.exports = (res, request) => {
    const params = getPostParameters('donations', { merchantAccount, shopperInteraction: 'ContAuth', ...request });
    post(params, (error, response, body) => handleCallback({ error, response, body }, res));
};
