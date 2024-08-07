const express = require('express');
const adyenWebServer = require('./index');

const shouldHostStorybook = process.argv.at(-1) === 'storybook';

console.log(`Starting @adyen/adyen-web-server ${shouldHostStorybook ? 'with storybook' : ''}`);

adyenWebServer(express(), { listen: true, shouldHostStorybook });
