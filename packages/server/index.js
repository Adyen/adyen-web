const path = require('path');
const express = require('express');
const https = require('https');
const fs = require('fs');
require('dotenv').config({ path: path.resolve('../../', '.env') });
const getPaymentMethods = require('./api/paymentMethods');
const getPaymentMethodsBalance = require('./api/paymentMethodsBalance');
const makePayment = require('./api/payments');
const postDetails = require('./api/details');
const createOrder = require('./api/orders');
const cancelOrder = require('./api/ordersCancel');
const createSession = require('./api/sessions');
const mockAddressSearch = require('./api/mock/addressSearch');
const getDonationCampaigns = require('./api/donationCampaign');
const createDonation = require('./api/donation');
const paypalUpdateOrder = require('./api/paypalUpdateOrder');
const getTranslation = require('./api/translations');

// Load environment variables
const isHttps = process.env.IS_HTTPS === 'true';
const sslKeyPath = process.env.CERT_KEY_PATH;
const sslCertPath = process.env.CERT_PATH;

// Read the SSL certificate and key
const key = sslKeyPath && fs.readFileSync(sslKeyPath, 'utf8');
const cert = sslCertPath && fs.readFileSync(sslCertPath, 'utf8');

module.exports = (app = express(), options = {}) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    if (options.shouldHostStorybook) {
        // Serve the storybook production build
        app.use(express.static(path.join(__dirname, '../lib/storybook-static')));
    }

    app.all('/api/paypal/updateOrder', (req, res) => paypalUpdateOrder(res, req.body));

    app.all('/api/paymentMethods', (req, res) => getPaymentMethods(res, req.body));

    app.all('/api/paymentMethods/balance', (req, res) => getPaymentMethodsBalance(res, req.body));

    app.all('/api/payments', (req, res) => makePayment(res, req.body));

    app.all('/api/details', (req, res) => postDetails(res, req.body));

    app.all('/api/orders', (req, res) => createOrder(res, req.body));

    app.all('/api/orders/cancel', (req, res) => cancelOrder(res, req.body));

    app.all('/api/sessions', (req, res) => createSession(res, req.body));

    app.all('/api/mock/addressSearch', (req, res) => mockAddressSearch(res, req));

    app.all('/api/donationCampaigns', (req, res) => getDonationCampaigns(res, req.body));

    app.all('/api/donations', (req, res) => createDonation(res, req.body));

    app.all('/sdk/:adyenWebVersion/translations/:locale.json', (req, res) => getTranslation(res, req));

    if (options.listen) {
        const port = process.env.PORT || 3030;

        isHttps
            ? https.createServer({ key, cert }, app).listen(port, () => {
                  console.log(`HTTPS server running on port ${port}`);
              })
            : app.listen(port, () => console.log(`Listening on localhost:${port}`));
    }

    return app;
};
