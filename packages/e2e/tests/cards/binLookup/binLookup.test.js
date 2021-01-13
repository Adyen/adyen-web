const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') }); // 2 dirs up, apparently!

import { RequestLogger, Selector } from 'testcafe';
import { start, getIframeSelector, getFromWindow } from '../../utils/commonUtils';
import cu from '../utils/cardUtils';
import { CARDS_URL } from '../../pages';
import { DUAL_BRANDED_CARD, REGULAR_TEST_CARD, MAESTRO_CARD, UNKNOWN_BIN_CARD } from '../utils/constants';

const url = `https://checkoutshopper-test.adyen.com/checkoutshopper/v1/bin/binLookup?token=${process.env.CLIENT_KEY}`;

const logger = RequestLogger(
    { url, method: 'post' },
    {
        logResponseHeaders: true,
        logResponseBody: true
    }
);

const errorLabel = Selector('.card-field .adyen-checkout__error-text');

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.card-field iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing binLookup response`
    .page(CARDS_URL)
    .clientScripts('binLookup.clientScripts.js')
    .requestHooks(logger);

test('Enter number of known dual branded card, ' + 'then inspect body for expected properties ', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Fill card field with known dual branded number
    await cardUtils.fillCardNumber(t, DUAL_BRANDED_CARD);

    await t
        // Allow time for the binLookup call, which we expect to be successful
        .wait(1000)
        .expect(logger.contains(r => r.response.statusCode === 200))
        .ok();

    const responseBodyBuffer = logger.requests[0].response.body;

    const responseBody = JSON.parse(responseBodyBuffer);

    await t
        .expect(responseBody.supportedBrands.length)
        .eql(2)
        .expect(responseBody.detectedBrands.length)
        .eql(2)
        .expect(responseBody.issuingCountryCode.length)
        .eql(2)
        .expect(responseBody.requestId.length)
        .notEql(0);
});

test('Enter number of regular, non dual branded, card, ' + 'then inspect body for expected properties ', async t => {
    logger.clear();

    await start(t, 2000, TEST_SPEED);

    // Fill card field with regular number
    await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    await t
        // Allow time for the binLookup call, which we expect to be successful
        .wait(1000)
        .expect(logger.contains(r => r.response.statusCode === 200))
        .ok();

    const responseBodyBuffer = logger.requests[0].response.body;

    const responseBody = JSON.parse(responseBodyBuffer);

    await t
        .expect(responseBody.supportedBrands.length)
        .eql(1)
        .expect(responseBody.detectedBrands.length)
        .eql(1)
        .expect(responseBody.issuingCountryCode.length)
        .eql(2)
        .expect(responseBody.requestId.length)
        .notEql(0);
});

test('Enter number of unsupported card, ' + 'then inspect body for expected properties ' + 'then check UI shows an error', async t => {
    logger.clear();

    await start(t, 2000, TEST_SPEED);

    // Fill card field with regular number
    await cardUtils.fillCardNumber(t, MAESTRO_CARD);

    await t
        // Allow time for the binLookup call, which we expect to be successful
        .wait(1000)
        .expect(logger.contains(r => r.response.statusCode === 200))
        .ok();

    const responseBodyBuffer = logger.requests[0].response.body;

    const responseBody = JSON.parse(responseBodyBuffer);

    await t
        .expect(responseBody.supportedBrands)
        .typeOf('undefined')
        .expect(responseBody.detectedBrands.length)
        .eql(1)
        .expect(responseBody.issuingCountryCode.length)
        .eql(2)
        .expect(responseBody.requestId.length)
        .notEql(0);

    // Test UI shows "Unsupported card" error
    await t
        .expect(errorLabel.exists)
        .ok()
        // with text
        .expect(errorLabel.withExactText('Unsupported card entered').exists)
        .ok();
});

test('Enter number of card that is not in the test Dbs, ' + 'then inspect body for expected properties ', async t => {
    logger.clear();

    await start(t, 2000, TEST_SPEED);

    // Fill card field with regular number
    await cardUtils.fillCardNumber(t, UNKNOWN_BIN_CARD);

    await t
        // Allow time for the binLookup call, which we expect to be successful
        .wait(1000)
        .expect(logger.contains(r => r.response.statusCode === 200))
        .ok();

    const responseBodyBuffer = logger.requests[0].response.body;

    const responseBody = JSON.parse(responseBodyBuffer);

    await t
        .expect(responseBody.supportedBrands)
        .typeOf('undefined')
        .expect(responseBody.detectedBrands)
        .typeOf('undefined')
        .expect(responseBody.issuingCountryCode)
        .typeOf('undefined')
        .expect(responseBody.requestId.length)
        .notEql(0);
});

/**
 * TEST CALLBACKS
 */

test('Enter number of regular, non dual branded, card, ' + 'then inspect callback for expected properties ', async t => {
    logger.clear();

    await start(t, 2000, TEST_SPEED);

    // Fill card field with regular number
    await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    await t
        // Allow time for the binLookup call, which we expect to be successful
        .wait(1000)
        .expect(logger.contains(r => r.response.statusCode === 200))
        .ok();

    await t
        .expect(getFromWindow('binLookupObj', 'type'))
        .eql('card')
        .expect(getFromWindow('binLookupObj', 'supportedBrands'))
        .eql(['mc'])
        .expect(getFromWindow('binLookupObj', 'detectedBrands'))
        .eql(['mc']);
});

test('Enter number of unsupported card, ' + 'then inspect callbacks for expected properties ', async t => {
    logger.clear();

    await start(t, 2000, TEST_SPEED);

    // Fill card field with regular number
    await cardUtils.fillCardNumber(t, MAESTRO_CARD);

    await t
        // Allow time for the binLookup call, which we expect to be successful
        .wait(1000)
        .expect(logger.contains(r => r.response.statusCode === 200))
        .ok();

    await t
        .expect(getFromWindow('binLookupObj', 'type'))
        .eql('card')
        .expect(getFromWindow('binLookupObj', 'supportedBrands'))
        .eql(['mc', 'visa', 'amex', 'cartebancaire'])
        .expect(getFromWindow('binLookupObj', 'detectedBrands'))
        .eql(['maestro']);

    await t.expect(getFromWindow('errorObj', 'errorText')).eql('Unsupported card entered');
});
