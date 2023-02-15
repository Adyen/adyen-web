const { post } = require('request');
const getPostParameters = require('../utils/getPostParameters');
const handleCallback = require('../utils/handleCallback');
const { MERCHANT_ACCOUNT: merchantAccount } = require('../utils/config');

module.exports = (res, request) => {
    const params = getPostParameters('sessions', { merchantAccount, ...request });
    post(params, (error, response, body) => {
        global.sessionId = JSON.parse(body).id;
        handleCallback({ error, response, body }, res);
    });
};
