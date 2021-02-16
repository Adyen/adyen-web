const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') });

import { Selector, RequestLogger } from 'testcafe';
import { start, getIframeSelector, getIsValid } from '../../utils/commonUtils';
import cu from '../utils/cardUtils';
import { fillChallengeField, submitChallenge } from '../utils/threeDS2Utils';
import { THREEDS2_CHALLENGE_ONLY_CARD, THREEDS2_FRICTIONLESS_CARD, THREEDS2_FULL_FLOW_CARD } from '../utils/constants';
import { BASE_URL } from '../../pages';

const url = `${BASE_URL}/details`;

const logger = RequestLogger(
    { url, method: 'post' },
    {
        logRequestBody: true,
        //        stringifyRequestBody: true,
        logResponseHeaders: true,
        logResponseBody: true
        //        stringifyResponseBody: true
    }
);

const TEST_SPEED = 1;

const apiVersion = Number(process.env.API_VERSION.substr(1));

const iframeSelector = getIframeSelector('.adyen-checkout__payment-method--card iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing old (v66) 3DS2 Flow`
    .page(BASE_URL)
    .clientScripts('threeDS2.clientScripts.js')
    .requestHooks(logger);

if (apiVersion <= 66) {
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
            .expect(logger.contains(r => r.response.statusCode === 200))
            .ok()
            // Allow time for the alert to manifest
            .wait(2000);

        // Check the value of the alert text
        const history = await t.getNativeDialogHistory();
        await t.expect(history[0].text).eql('Authorised');
    });

    test('Fill in card number that will trigger full flow (fingerprint & challenge)', async t => {
        logger.clear();

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
            /**
             * Allow time for the FIRST details call, which we expect to be successful
             */
            .wait(1000)
            .expect(logger.contains(r => JSON.parse(r.request.body).details['threeds2.fingerprint'] && r.response.statusCode === 200))
            .ok();

        // Complete challenge
        await fillChallengeField(t);
        await submitChallenge(t);

        await t
            /**
             * Allow time for the SECOND details call, which we expect to be successful
             */
            .wait(1000)
            .expect(logger.contains(r => JSON.parse(r.request.body).details['threeds2.challengeResult'] && r.response.statusCode === 200))
            .ok()
            .wait(2000);

        // Check request body is in the expected form
        const requestBodyBuffer = logger.requests[1].request.body;
        const requestBody = JSON.parse(requestBodyBuffer);

        await t
            .expect(requestBody.details['threeds2.challengeResult'])
            .ok()
            .expect(requestBody.paymentData)
            .ok();

        // Check the value of the alert text
        const history = await t.getNativeDialogHistory();
        await t.expect(history[0].text).eql('Authorised');
    });

    test('Fill in card number that will trigger challenge-only flow', async t => {
        logger.clear();

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
            .expect(logger.contains(r => r.response.statusCode === 200))
            .ok()
            .wait(2000);

        // Check the value of the alert text
        const history = await t.getNativeDialogHistory();
        await t.expect(history[0].text).eql('Authorised');
    });
} else {
    test(`Skip testing new 3DS2 flow since api version is too high (v${apiVersion})`, async t => {
        await t.wait(250);
    });
}
