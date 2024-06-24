// eslint-disable-next-line @typescript-eslint/no-var-requires
const checkoutDevServer = require('@adyen/adyen-web-server');

const middleware = router => {
    checkoutDevServer(router);
};

module.exports = middleware;
