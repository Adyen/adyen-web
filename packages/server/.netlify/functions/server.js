const serverless = require('serverless-http');
const express = require('express');

const app = express();

const adyenWebExpress  = adyenWebServer(app);

const handler = serverless(adyenWebExpress);
module.exports.funcName = async (context, req) => {
  context.res = await handler(context, req);
}