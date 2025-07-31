import serverless from 'serverless-http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Import your API handlers
import getPaymentMethods from '../../api/paymentMethods.js';
import getPaymentMethodsBalance from '../../api/paymentMethodsBalance.js';
import makePayment from '../../api/payments.js';
import postDetails from '../../api/details.js';
import createOrder from '../../api/orders.js';
import cancelOrder from '../../api/ordersCancel.js';
import createSession from '../../api/sessions.js';
import mockAddressSearch from '../../api/mock/addressSearch.js';
import getDonationCampaigns from '../../api/donationCampaign.js';
import createDonation from '../../api/donation.js';
import paypalUpdateOrder from '../../api/paypalUpdateOrder.js';
import getTranslation from '../../api/translations.js';

// Create Express app
const app = express();

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Set up all API routes
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

// Wrap the Express app with serverless
const handler = serverless(app);

export default async (req, context) => {
  // Return the serverless handler
  return handler(req, context);
};
