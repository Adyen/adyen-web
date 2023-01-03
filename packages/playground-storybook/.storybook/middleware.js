const checkoutDevServer = require('@adyen/adyen-web-server');

const middleware = router => {
    checkoutDevServer(router);
};

module.exports = middleware;
