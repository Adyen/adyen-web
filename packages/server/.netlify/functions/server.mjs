import serverless from 'serverless-http';
import express from 'express';
import { createRequire } from 'module';

// Setup require for CommonJS modules
const require = createRequire(import.meta.url);

// Import the Express app factory from index.js
const createApp = require('../../index.js');

// Create Express app without starting the server
const app = createApp(express(), { listen: false });

// Add a health check endpoint
app.get('/hello', (req, res) => {
  res.status(200).send('Hello from Adyen Web API');
});

export const handler = serverless(app);
