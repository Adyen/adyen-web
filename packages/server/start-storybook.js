const express = require('express');
const adyenWebServer = require('./index');

console.log('Starting @adyen/adyen-web-server Storybook');

adyenWebServer(express(), { listen: true, shouldHostStorybook: true });
