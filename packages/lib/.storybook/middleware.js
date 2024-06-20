// eslint-disable-next-line @typescript-eslint/no-var-requires,import/no-extraneous-dependencies
const checkoutDevServer = require('@adyen/adyen-web-server');

const middleware = router => {
    checkoutDevServer(router);
};

module.exports = middleware;
