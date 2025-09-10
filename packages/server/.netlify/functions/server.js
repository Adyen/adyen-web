const serverless = require('serverless-http');
const express = require('express');
const adyenWebServer = require('../../index.js');

const app = express();

const adyenWebExpress = adyenWebServer(app);

// Export the handler function with the correct name
module.exports.handler = serverless(adyenWebExpress);