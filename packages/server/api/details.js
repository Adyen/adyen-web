const { post } = require('request');
const getPostParameters = require('../utils/getPostParameters');
const handleCallback = require('../utils/handleCallback');
const { MERCHANT_ACCOUNT: merchantAccount } = require('../utils/config');

module.exports = (res, request) => {
    const paypalPatchingData = {
        amount: {
            value: '9000',
            currency: 'USD'
        },
        // sessionId: global.sessionId,
        pspReference: global.pspReference
    };
    const params = getPostParameters('/payments/details', { merchantAccount, ...paypalPatchingData, ...request });

    console.log(params);

    post(params, (err, response, body) => handleCallback({ err, response, body }, res));
};
