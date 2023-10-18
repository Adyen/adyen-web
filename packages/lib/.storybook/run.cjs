/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') });

const isHttps = process.env.IS_HTTPS === 'true';
const certPath = process.env.CERT_PATH ?? path.resolve(__dirname, 'localhost.pem');
const certKeyPath = process.env.CERT_KEY_PATH ?? path.resolve(__dirname, 'localhost-key.pem');

const runStorybook = 'storybook dev --port 3020 --disable-telemetry';
const runStorybookHttps = `storybook dev --port 3020 --https --ssl-cert ${certPath} --ssl-key ${certKeyPath} --disable-telemetry`;

execSync(isHttps ? runStorybookHttps : runStorybook, { stdio: 'inherit' });
