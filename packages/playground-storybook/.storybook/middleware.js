const path = require('path');
const express = require('express');

require('dotenv').config({ path: path.resolve('../../../', '.env') });

const getOriginKeys = require('@adyen/adyen-web-server/api/originKeys');
const getPaymentMethods = require('@adyen/adyen-web-server/api/paymentMethods');
const getPaymentMethodsBalance = require('@adyen/adyen-web-server/api/paymentMethodsBalance');
const makePayment = require('@adyen/adyen-web-server/api/payments');
const postDetails = require('@adyen/adyen-web-server/api/details');
const createOrder = require('@adyen/adyen-web-server/api/orders');
const cancelOrder = require('@adyen/adyen-web-server/api/ordersCancel');
const createSession = require('@adyen/adyen-web-server/api/sessions');

const middleware = router => {
    router.use(express.json());
    router.use(express.urlencoded({ extended: true }));

    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    router.all('/originKeys', (req, res) => getOriginKeys(res, req));

    router.all('/paymentMethods', (req, res) => getPaymentMethods(res, req.body));

    router.all('/paymentMethods/balance', (req, res) => getPaymentMethodsBalance(res, req.body));

    router.all('/payments', (req, res) => makePayment(res, req.body));

    router.all('/details', (req, res) => postDetails(res, req.body));

    router.all('/orders', (req, res) => createOrder(res, req.body));

    router.all('/orders/cancel', (req, res) => cancelOrder(res, req.body));

    router.all('/sessions', (req, res) => createSession(res, req.body));
};

module.exports = middleware;
