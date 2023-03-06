const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') }); // 2 dirs up

import { RequestLogger, Selector } from 'testcafe';
import { start, getIframeSelector, getFromWindow } from '../../../utils/commonUtils';
import cu from '../../utils/cardUtils';
import { CARDS_URL } from '../../../pages';
import { BIN_LOOKUP_VERSION, DUAL_BRANDED_CARD, REGULAR_TEST_CARD, MAESTRO_CARD, UNKNOWN_BIN_CARD } from '../../utils/constants';

import LANG from '../../../../../lib/src/language/locales/en-US.json';

const url = `https://checkoutshopper-test.adyen.com/checkoutshopper/${BIN_LOOKUP_VERSION}/bin/binLookup?token=${process.env.CLIENT_KEY}`;

const logger = RequestLogger(
    { url, method: 'post' },
    {
        logResponseHeaders: true,
        logResponseBody: true
    }
);

const errorLabel = Selector('.card-field .adyen-checkout__error-text');

const UNSUPPORTED_CARD = LANG['error.va.sf-cc-num.03'];

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.card-field iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing binLookup v2 response`
    .page(CARDS_URL)
    .clientScripts('binLookup.clientScripts.js')
    .requestHooks(logger);

test('#1 Enter number of known dual branded card, ' + 'then inspect response body for expected properties ', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Fill card field with known dual branded number
    await cardUtils.fillCardNumber(t, DUAL_BRANDED_CARD);

    await t
        // Allow time for the binLookup call, which we expect to be successful
        .expect(logger.contains(r => r.response.statusCode === 200))
        .ok({ timeout: 5000 });

    const responseBodyBuffer = logger.requests[0].response.body;

    const responseBody = JSON.parse(responseBodyBuffer);

    await t
        .expect(responseBody.brands.length)
        .eql(2)
        .expect(responseBody.brands[0].supported)
        .eql(true)
        .expect(responseBody.brands[1].supported)
        .eql(true)
        .expect(responseBody.issuingCountryCode.length)
        .eql(2)
        .expect(responseBody.requestId.length)
        .notEql(0);
});

test('#2 Enter number of regular, non dual branded, card, ' + 'then inspect response body for expected properties ', async t => {
    logger.clear();

    await start(t, 2000, TEST_SPEED);

    // Fill card field with regular number
    await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    await t
        // Allow time for the binLookup call, which we expect to be successful
        .expect(logger.contains(r => r.response.statusCode === 200))
        .ok({ timeout: 5000 });

    const responseBodyBuffer = logger.requests[0].response.body;

    const responseBody = JSON.parse(responseBodyBuffer);

    await t
        .expect(responseBody.brands.length)
        .eql(1)
        .expect(responseBody.brands[0].supported)
        .eql(true)
        .expect(responseBody.issuingCountryCode.length)
        .eql(2)
        .expect(responseBody.requestId.length)
        .notEql(0);
});

test('#3 Enter number of unsupported card, ' + 'then inspect response body for expected properties ' + 'then check UI shows an error', async t => {
    logger.clear();

    await start(t, 2000, TEST_SPEED);

    // Fill card field with unsupported number
    await cardUtils.fillCardNumber(t, MAESTRO_CARD);

    await t
        // Allow time for the binLookup call, which we expect to be successful
        .expect(logger.contains(r => r.response.statusCode === 200))
        .ok({ timeout: 5000 });

    const responseBodyBuffer = logger.requests[0].response.body;

    const responseBody = JSON.parse(responseBodyBuffer);

    await t
        .expect(responseBody.brands.length)
        .eql(1)
        .expect(responseBody.brands[0].supported)
        .eql(false)
        .expect(responseBody.issuingCountryCode.length)
        .eql(2)
        .expect(responseBody.requestId.length)
        .notEql(0);

    // Test UI shows "Unsupported card" error
    await t
        .expect(errorLabel.exists)
        .ok()
        // with text
        .expect(errorLabel.withExactText(UNSUPPORTED_CARD).exists)
        .ok();
});

test('#4 Enter number of card that is not in the test Dbs, ' + 'then inspect response body for expected properties ', async t => {
    logger.clear();

    await start(t, 2000, TEST_SPEED);

    // Fill card field with unknown number
    await cardUtils.fillCardNumber(t, UNKNOWN_BIN_CARD);

    await t
        // Allow time for the binLookup call, which we expect to be successful
        .expect(logger.contains(r => r.response.statusCode === 200))
        .ok({ timeout: 5000 });

    const responseBodyBuffer = logger.requests[0].response.body;

    const responseBody = JSON.parse(responseBodyBuffer);

    await t
        .expect(responseBody.brands)
        .typeOf('undefined')
        .expect(responseBody.issuingCountryCode)
        .typeOf('undefined')
        .expect(responseBody.requestId.length)
        .notEql(0);
});

/**
 * TEST CALLBACKS
 */
test('#5 Enter number of dual branded card, ' + 'then inspect callback for expected properties ', async t => {
    logger.clear();

    await start(t, 2000, TEST_SPEED);

    /// Fill card field with known dual branded number
    await cardUtils.fillCardNumber(t, DUAL_BRANDED_CARD);

    await t
        // Allow time for the binLookup call, which we expect to be successful
        .expect(logger.contains(r => r.response.statusCode === 200))
        .ok({ timeout: 5000 });

    await t
        .expect(getFromWindow('binLookupObj', 'type'))
        .eql('card')
        .expect(getFromWindow('binLookupObj', 'supportedBrands'))
        .eql(['visa', 'cartebancaire'])
        .expect(getFromWindow('binLookupObj', 'detectedBrands'))
        .eql(['visa', 'cartebancaire'])
        .expect(getFromWindow('binLookupObj', 'brands'))
        .eql(['mc', 'visa', 'amex', 'cartebancaire']);
});

test('#6 Enter number of regular, non dual branded, card, ' + 'then inspect callback for expected properties ', async t => {
    logger.clear();

    await start(t, 2000, TEST_SPEED);

    // Fill card field with regular number
    await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    await t
        // Allow time for the binLookup call, which we expect to be successful
        .expect(logger.contains(r => r.response.statusCode === 200))
        .ok({ timeout: 5000 });

    await t
        .expect(getFromWindow('binLookupObj', 'type'))
        .eql('card')
        .expect(getFromWindow('binLookupObj', 'supportedBrands'))
        .eql(['mc'])
        .expect(getFromWindow('binLookupObj', 'detectedBrands'))
        .eql(['mc'])
        .expect(getFromWindow('binLookupObj', 'brands'))
        .eql(['mc', 'visa', 'amex', 'cartebancaire']);
});

test('#7 Enter number of unsupported card, ' + 'then inspect callbacks for expected properties ', async t => {
    logger.clear();

    await start(t, 2000, TEST_SPEED);

    // Fill card field with unsupported number
    await cardUtils.fillCardNumber(t, MAESTRO_CARD);

    await t
        // Allow time for the binLookup call, which we expect to be successful
        .expect(logger.contains(r => r.response.statusCode === 200))
        .ok({ timeout: 5000 });

    await t
        .expect(getFromWindow('binLookupObj', 'type'))
        .eql('card')
        .expect(getFromWindow('binLookupObj', 'supportedBrands'))
        .eql(null)
        .expect(getFromWindow('binLookupObj', 'detectedBrands'))
        .eql(['maestro'])
        .expect(getFromWindow('binLookupObj', 'brands'))
        .eql(['mc', 'visa', 'amex', 'cartebancaire']);

    const cardError = await getFromWindow('errorObj', 'encryptedCardNumber');
    await t.expect(cardError.errorMessage).eql('Unsupported card entered');
});

test('#8 Enter number of card that is not in the test Dbs, ' + 'then inspect callbacks for expected properties ', async t => {
    logger.clear();

    await start(t, 2000, TEST_SPEED);

    // Fill card field with unknown number
    await cardUtils.fillCardNumber(t, UNKNOWN_BIN_CARD);

    await t
        // Allow time for the binLookup call, which we expect to be successful
        .expect(logger.contains(r => r.response.statusCode === 200))
        .ok({ timeout: 5000 });

    await t
        .expect(getFromWindow('binLookupObj', 'type'))
        .eql('card')
        .expect(getFromWindow('binLookupObj', 'supportedBrands'))
        .eql(null)
        .expect(getFromWindow('binLookupObj', 'detectedBrands'))
        .eql(null)
        .expect(getFromWindow('binLookupObj', 'brands'))
        .eql(['mc', 'visa', 'amex', 'cartebancaire']);
});
