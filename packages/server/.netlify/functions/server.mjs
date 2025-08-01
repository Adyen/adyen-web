import serverless from 'serverless-http';
import express from 'express';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Setup require for CommonJS modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
