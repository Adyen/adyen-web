const makePostRequest = require('../utils/makePostRequest');
const handleCallback = require('../utils/handleCallback');

module.exports = async (res, request) => {
    const originDomains = [`${request.protocol}://${request.headers.host}`];
    const response = await makePostRequest('originKeys', { originDomains });
    handleCallback(response, res);
};
