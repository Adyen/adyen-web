const path = require('path');
const express = require('express');
require('dotenv').config({ path: path.resolve('../../', '.env') });
const getPaymentMethods = require('./api/paymentMethods');
const getPaymentMethodsBalance = require('./api/paymentMethodsBalance');
const getOriginKeys = require('./api/originKeys');
const makePayment = require('./api/payments');
const postDetails = require('./api/details');
const createOrder = require('./api/orders');
const cancelOrder = require('./api/ordersCancel');
const createSession = require('./api/sessions');

module.exports = (app = express(), options = {}) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

        const tempNonce = 'nonce-c29tZSBjb29sIHN0cmluZyB3aWxsIHBvcCB1cCAxMjM=';

        res.header(
            'Content-Security-Policy',
            `default-src 'self'; script-src 'self' '${tempNonce}'; style-src 'self' '${tempNonce}'; connect-src ws://localhost:3020 https://checkoutshopper-test.adyen.com http://localhost:3020 https://www.sandbox.paypal.com; frame-src https://www.sandbox.paypal.com https://checkoutshopper-test.adyen.com; img-src 'self' data: https://checkoutshopper-test.adyen.com/;`
        );
        next();
    });

    app.all('/originKeys', (req, res) => getOriginKeys(res, req));

    app.all('/paymentMethods', (req, res) => getPaymentMethods(res, req.body));

    app.all('/paymentMethods/balance', (req, res) => getPaymentMethodsBalance(res, req.body));

    app.all('/payments', (req, res) => makePayment(res, req.body));

    app.all('/details', (req, res) => postDetails(res, req.body));

    app.all('/orders', (req, res) => createOrder(res, req.body));

    app.all('/orders/cancel', (req, res) => cancelOrder(res, req.body));

    app.all('/sessions', (req, res) => createSession(res, req.body));

    if (options.listen) {
        const port = process.env.PORT || 3020;
        app.listen(port, () => console.log(`Listening on localhost:${port}`));
    }

    return app;
};
