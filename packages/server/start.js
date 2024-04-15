const express = require('express');
const adyenWebServer = require('./index');

console.log('Starting @adyen/adyen-web-server');

adyenWebServer(express(), { listen: true });
