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
    console.log(`[STARTUP] Initializing server with options:`, JSON.stringify(options, null, 2));
    console.log(`[STARTUP] Express version:`, require('express/package.json').version);
    console.log(`[STARTUP] Node version:`, process.version);
    console.log(`[STARTUP] Environment:`, process.env.NODE_ENV || 'development');
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Request logging middleware
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        console.log('Headers:', JSON.stringify(req.headers, null, 2));
        if (req.body && Object.keys(req.body).length > 0) {
            console.log('Body:', JSON.stringify(req.body, null, 2));
        }
        next();
    });

    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        console.log(`[CORS] Headers set for ${req.method} ${req.url}`);
        next();
    });

    if (options.shouldHostStorybook) {
        // Serve the storybook production build
        app.use(express.static(path.join(__dirname, '../lib/storybook-static')));
    }

    // API route logging middleware
    app.use('/api/*', (req, res, next) => {
        console.log(`[API] Processing ${req.method} ${req.url}`);
        console.log(`[API] Route params:`, req.params);
        console.log(`[API] Query params:`, req.query);
        next();
    });

    app.all('/api/paypal/updateOrder', async (req, res, next) => {
        try {
            console.log(`[ROUTE] /api/paypal/updateOrder called`);
            await paypalUpdateOrder(res, req.body);
        } catch (error) {
            console.error(`[ROUTE ERROR] /api/paypal/updateOrder:`, error);
            next(error);
        }
    });

    app.all('/api/paymentMethods', async (req, res, next) => {
        try {
            console.log(`[ROUTE] /api/paymentMethods called`);
            await getPaymentMethods(res, req.body);
        } catch (error) {
            console.error(`[ROUTE ERROR] /api/paymentMethods:`, error);
            next(error);
        }
    });

    app.all('/api/paymentMethods/balance', async (req, res, next) => {
        try {
            console.log(`[ROUTE] /api/paymentMethods/balance called`);
            await getPaymentMethodsBalance(res, req.body);
        } catch (error) {
            console.error(`[ROUTE ERROR] /api/paymentMethods/balance:`, error);
            next(error);
        }
    });

    app.all('/api/payments', async (req, res, next) => {
        try {
            console.log(`[ROUTE] /api/payments called`);
            await makePayment(res, req.body);
        } catch (error) {
            console.error(`[ROUTE ERROR] /api/payments:`, error);
            next(error);
        }
    });

    app.all('/api/details', async (req, res, next) => {
        try {
            console.log(`[ROUTE] /api/details called`);
            await postDetails(res, req.body);
        } catch (error) {
            console.error(`[ROUTE ERROR] /api/details:`, error);
            next(error);
        }
    });

    app.all('/api/orders', async (req, res, next) => {
        try {
            console.log(`[ROUTE] /api/orders called`);
            await createOrder(res, req.body);
        } catch (error) {
            console.error(`[ROUTE ERROR] /api/orders:`, error);
            next(error);
        }
    });

    app.all('/api/orders/cancel', async (req, res, next) => {
        try {
            console.log(`[ROUTE] /api/orders/cancel called`);
            await cancelOrder(res, req.body);
        } catch (error) {
            console.error(`[ROUTE ERROR] /api/orders/cancel:`, error);
            next(error);
        }
    });

    app.all('/api/sessions', async (req, res, next) => {
        try {
            console.log(`[ROUTE] /api/sessions called`);
            await createSession(res, req.body);
        } catch (error) {
            console.error(`[ROUTE ERROR] /api/sessions:`, error);
            next(error);
        }
    });

    app.all('/api/mock/addressSearch', async (req, res, next) => {
        try {
            console.log(`[ROUTE] /api/mock/addressSearch called`);
            await mockAddressSearch(res, req);
        } catch (error) {
            console.error(`[ROUTE ERROR] /api/mock/addressSearch:`, error);
            next(error);
        }
    });

    app.all('/api/donationCampaigns', async (req, res, next) => {
        try {
            console.log(`[ROUTE] /api/donationCampaigns called`);
            await getDonationCampaigns(res, req.body);
        } catch (error) {
            console.error(`[ROUTE ERROR] /api/donationCampaigns:`, error);
            next(error);
        }
    });

    app.all('/api/donations', async (req, res, next) => {
        try {
            console.log(`[ROUTE] /api/donations called`);
            await createDonation(res, req.body);
        } catch (error) {
            console.error(`[ROUTE ERROR] /api/donations:`, error);
            next(error);
        }
    });

    app.all('/api/health', (req, res) => {
        console.log(`[ROUTE] /api/health called`);
        res.status(200).send('OK');
    });

    app.all('/sdk/:adyenWebVersion/translations/:locale.json', async (req, res, next) => {
        try {
            console.log(`[ROUTE] /sdk/:adyenWebVersion/translations/:locale.json called`);
            await getTranslation(res, req);
        } catch (error) {
            console.error(`[ROUTE ERROR] /sdk/:adyenWebVersion/translations/:locale.json:`, error);
            next(error);
        }
    });

    // Error handling middleware
    app.use((error, req, res, next) => {
        console.error(`[ERROR] ${error.message}`);
        console.error(`[ERROR] Stack:`, error.stack);
        console.error(`[ERROR] Request: ${req.method} ${req.url}`);
        console.error(`[ERROR] Body:`, JSON.stringify(req.body, null, 2));
        
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Internal Server Error', 
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    // 404 handler
    app.use('*', (req, res) => {
        console.log(`[404] Route not found: ${req.method} ${req.url}`);
        res.status(404).json({ 
            error: 'Route not found', 
            method: req.method, 
            url: req.url,
            timestamp: new Date().toISOString()
        });
    });

    if (options.listen) {
        // If Express is hosting Storybook, we use the default port 3020.
        // If Express is being used as server to make HTTP requests along with Storybook server, we use port 3030
        const port = options.shouldHostStorybook ? 3020 : 3030;

        isHttps
            ? https.createServer({ key, cert }, app).listen(port, () => {
                  console.log(`HTTPS server running on port ${port}`);
              })
            : app.listen(port, () => console.log(`Listening on localhost:${port}`));
    }

    return app;
};
