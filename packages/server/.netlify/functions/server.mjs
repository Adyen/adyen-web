import serverless from 'serverless-http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Define a function to dynamically import handlers
async function getHandlers() {
  try {
    // We need to dynamically import these as they use require() internally
    // which isn't available in ESM
    const handlers = {};
    
    // Use dynamic imports for all handlers
    const importPath = '../../api/';
    
    // Import all handlers dynamically
    handlers.getPaymentMethods = (await import(`${importPath}paymentMethods.js`)).default;
    handlers.getPaymentMethodsBalance = (await import(`${importPath}paymentMethodsBalance.js`)).default;
    handlers.makePayment = (await import(`${importPath}payments.js`)).default;
    handlers.postDetails = (await import(`${importPath}details.js`)).default;
    handlers.createOrder = (await import(`${importPath}orders.js`)).default;
    handlers.cancelOrder = (await import(`${importPath}ordersCancel.js`)).default;
    handlers.createSession = (await import(`${importPath}sessions.js`)).default;
    handlers.mockAddressSearch = (await import(`${importPath}mock/addressSearch.js`)).default;
    handlers.getDonationCampaigns = (await import(`${importPath}donationCampaign.js`)).default;
    handlers.createDonation = (await import(`${importPath}donation.js`)).default;
    handlers.paypalUpdateOrder = (await import(`${importPath}paypalUpdateOrder.js`)).default;
    handlers.getTranslation = (await import(`${importPath}translations.js`)).default;
    
    return handlers;
  } catch (error) {
    console.error('Error loading handlers:', error);
    throw error;
  }
}

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
// Setup a health check endpoint
app.get('/hello', (req, res) => {
  res.status(200).send("Hello, world from the Adyen Web server!");
});

// We'll set up the API routes when we have the handlers
let handlers = null;

// Export the handler function
export default async (req, context) => {
  try {
    // Initialize handlers if not already done
    if (!handlers) {
      handlers = await getHandlers();
      
      // Now set up the API routes
      app.all('/api/paypal/updateOrder', (req, res) => handlers.paypalUpdateOrder(res, req.body));
      app.all('/api/paymentMethods', (req, res) => handlers.getPaymentMethods(res, req.body));
      app.all('/api/paymentMethods/balance', (req, res) => handlers.getPaymentMethodsBalance(res, req.body));
      app.all('/api/payments', (req, res) => handlers.makePayment(res, req.body));
      app.all('/api/details', (req, res) => handlers.postDetails(res, req.body));
      app.all('/api/orders', (req, res) => handlers.createOrder(res, req.body));
      app.all('/api/orders/cancel', (req, res) => handlers.cancelOrder(res, req.body));
      app.all('/api/sessions', (req, res) => handlers.createSession(res, req.body));
      app.all('/api/mock/addressSearch', (req, res) => handlers.mockAddressSearch(res, req));
      app.all('/api/donationCampaigns', (req, res) => handlers.getDonationCampaigns(res, req.body));
      app.all('/api/donations', (req, res) => handlers.createDonation(res, req.body));
      app.all('/sdk/:adyenWebVersion/translations/:locale.json', (req, res) => handlers.getTranslation(res, req));
    }
    
    // Create the serverless handler
    const serverlessHandler = serverless(app);
    
    // Process the request body if it exists and needs transformation
    const method = req.method || 'GET';
    const headers = req.headers || new Headers();
    let body;
    
    if (req.body) {
      if (typeof req.body !== 'string' && !(req.body instanceof ReadableStream)) {
        // Convert body to string if it's an object
        body = JSON.stringify(req.body);
      } else {
        body = req.body;
      }
    }

    // Create a new request with properly processed body if needed
    const event = body ? new Request(req.url, { method, headers, body }) : req;
    
    // Call the serverless handler with the processed request
    return await serverlessHandler(event, context);
  } catch (error) {
    console.error('Error in handler:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
