const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') }); // 2 dirs up, apparently!

import { Selector, RequestLogger } from 'testcafe';
import { start, getIframeSelector, getIsValid } from '../../utils/commonUtils';
import cu from '../utils/cardUtils';
import { fillChallengeField, submitChallenge } from '../utils/threeDS2Utils';
import { THREEDS2_CHALLENGE_ONLY_CARD, THREEDS2_FRICTIONLESS_CARD, THREEDS2_FULL_FLOW_CARD } from '../utils/constants';
import { BASE_URL } from '../../pages';

const detailsURL = `${BASE_URL}/details`;

const loggerDetails = RequestLogger(
    { detailsURL, method: 'post' },
    {
        logResponseHeaders: true,
        logResponseBody: true
    }
);

const submitThreeDS2FingerprintURL = `https://checkoutshopper-test.adyen.com/checkoutshopper/v1/submitThreeDS2Fingerprint?token=${process.env.CLIENT_KEY}`;

const loggerSubmitThreeDS2 = RequestLogger(
    { submitThreeDS2FingerprintURL, method: 'post' },
    {
        logResponseHeaders: true,
        logResponseBody: true
    }
);

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.adyen-checkout__payment-method--card iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing new (v67) hybrid 3DS2 Flow`
    .page(BASE_URL)
    .clientScripts('threeDS2.clientScripts.js')
    .requestHooks([loggerDetails, loggerSubmitThreeDS2]);

test('Fill in card number that will trigger frictionless flow', async t => {
    await start(t, 2000, TEST_SPEED);

    // Set handler for the alert window
    await t.setNativeDialogHandler(() => true);

    // Fill card fields
    await cardUtils.fillCardNumber(t, THREEDS2_FRICTIONLESS_CARD);
    await cardUtils.fillDateAndCVC(t);

    // Expect card to now be valid
    await t.expect(getIsValid('dropin')).eql(true);

    // Click pay
    await t
        .click('.adyen-checkout__card-input .adyen-checkout__button--pay')
        // Expect no errors
        .expect(Selector('.adyen-checkout__field--error').exists)
        .notOk()
        // Allow time for the ONLY details call, which we expect to be successful
        .wait(1000)
        .expect(loggerDetails.contains(r => r.response.statusCode === 200))
        .ok()
        // Allow time for the alert to manifest
        .wait(2000);

    // Check the value of the alert text
    const history = await t.getNativeDialogHistory();
    await t.expect(history[0].text).eql('Authorised');
});

test('Fill in card number that will trigger full flow (fingerprint & challenge)', async t => {
    loggerDetails.clear();

    await start(t, 2000, TEST_SPEED);

    // Set handler for the alert window
    await t.setNativeDialogHandler(() => true);

    // Fill card fields
    await cardUtils.fillCardNumber(t, THREEDS2_FULL_FLOW_CARD);
    await cardUtils.fillDateAndCVC(t);

    // Expect card to now be valid
    await t.expect(getIsValid('dropin')).eql(true);

    // Click pay
    await t
        .click('.adyen-checkout__card-input .adyen-checkout__button--pay')
        // Expect no errors
        .expect(Selector('.adyen-checkout__field--error').exists)
        .notOk()
        // Allow time for the /submitThreeDS2Fingerprint call, which we expect to be successful
        .wait(1000)
        .expect(loggerSubmitThreeDS2.contains(r => r.response.statusCode === 200))
        .ok();

    // console.log(logger.requests[0].response.headers);

    // Complete challenge
    await fillChallengeField(t);
    await submitChallenge(t);

    await t
        // Allow time for the /details call, which we expect to be successful
        .wait(1000)
        .expect(loggerDetails.contains(r => r.response.statusCode === 200))
        .ok()
        .wait(1000);

    // console.log(logger.requests[1].response.headers);

    // Check the value of the alert text
    const history = await t.getNativeDialogHistory();
    await t.expect(history[0].text).eql('Authorised');
});

test('Fill in card number that will trigger challenge-only flow', async t => {
    loggerDetails.clear();

    await start(t, 2000, TEST_SPEED);

    // Set handler for the alert window
    await t.setNativeDialogHandler(() => true);

    // Fill card fields
    await cardUtils.fillCardNumber(t, THREEDS2_CHALLENGE_ONLY_CARD);
    await cardUtils.fillDateAndCVC(t);

    // Expect card to now be valid
    await t.expect(getIsValid('dropin')).eql(true);

    // Click pay
    await t
        .click('.adyen-checkout__card-input .adyen-checkout__button--pay')
        // Expect no errors
        .expect(Selector('.adyen-checkout__field--error').exists)
        .notOk();

    // Complete challenge
    await fillChallengeField(t);
    await submitChallenge(t);

    await t
        // Allow time for the ONLY details call, which we expect to be successful
        .wait(1000)
        .expect(loggerDetails.contains(r => r.response.statusCode === 200))
        .ok()
        .wait(2000);

    // Check the value of the alert text
    const history = await t.getNativeDialogHistory();
    await t.expect(history[0].text).eql('Authorised');
});
