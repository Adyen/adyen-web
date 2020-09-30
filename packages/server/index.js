const path = require('path');
const express = require('express');
require('dotenv').config({ path: path.resolve('../../', '.env') });
const getPaymentMethods = require('./api/paymentMethods');
const getPaymentMethodsBalance = require('./api/paymentMethodsBalance');
const getOriginKeys = require('./api/originKeys');
const makePayment = require('./api/payments');
const postDetails = require('./api/details');
const createOrder = require('./api/orders');

module.exports = (app = express(), options = {}) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    app.all('/originKeys', (req, res) => getOriginKeys(res, req));

    app.all('/paymentMethods', (req, res) => getPaymentMethods(res, req.body));

    app.all('/paymentMethods/balance', (req, res) => getPaymentMethodsBalance(res, req.body));

    app.all('/payments', (req, res) => makePayment(res, req.body));

    app.all('/details', (req, res) => postDetails(res, req.body));

    app.all('/orders', (req, res) => createOrder(res, req.body));

    if (options.listen) {
        const port = process.env.PORT || 3020;
        app.listen(port, () => console.log(`Listening on localhost:${port}`));
    }

    return app;
};
