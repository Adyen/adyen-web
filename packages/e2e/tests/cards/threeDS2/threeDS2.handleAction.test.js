const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') });

import { Selector, RequestLogger } from 'testcafe';
import { start, getIframeSelector, getIsValid } from '../../utils/commonUtils';
import cu from '../utils/cardUtils';
import { fillChallengeField, submitChallenge } from '../utils/threeDS2Utils';
import { THREEDS2_CHALLENGE_ONLY_CARD, THREEDS2_FULL_FLOW_CARD } from '../utils/constants';
import { BASE_URL } from '../../pages';

const detailsURL = `${BASE_URL}/details`;
const submitThreeDS2FingerprintURL = `https://checkoutshopper-test.adyen.com/checkoutshopper/v1/submitThreeDS2Fingerprint?token=${process.env.CLIENT_KEY}`;

const logger = RequestLogger(
    [
        { url: detailsURL, method: 'post' },
        { url: submitThreeDS2FingerprintURL, method: 'post' }
    ],
    {
        logRequestBody: true,
        logResponseHeaders: true,
        logResponseBody: true
    }
);

const apiVersion = Number(process.env.API_VERSION.substr(1));

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.adyen-checkout__payment-method--card iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing new (v67) 3DS2 Flow (handleAction config)`
    .page(BASE_URL)
    .clientScripts('threeDS2.handleAction.clientScripts.js')
    .requestHooks(logger);

if (apiVersion >= 67) {
    test('Fill in card number that will trigger full flow (fingerprint & challenge) with challenge window size set in the call to handleAction', async t => {
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
             *  Allow time for the /submitThreeDS2Fingerprint call, which we expect to be successful
             */
            .wait(2000)
            .expect(logger.contains(r => r.request.url.indexOf('/submitThreeDS2Fingerprint') > -1 && r.response.statusCode === 200))
            .ok();

        //        console.log('logger.requests[0].response', logger.requests[0].response);

        // Check challenge window size is read from config prop set in handleAction call
        await t.expect(Selector('.adyen-checkout__threeds2__challenge--01').exists).ok();

        // Complete challenge
        await fillChallengeField(t);
        await submitChallenge(t);

        await t
            // Allow time for the /details call, which we expect to be successful
            .wait(2000)
            .expect(logger.contains(r => r.request.url.indexOf('/details') > -1 && r.response.statusCode === 200))
            .ok()
            .wait(1000);

        // Check request body is in the expected form
        const requestBodyBuffer = logger.requests[1].request.body;
        const requestBody = JSON.parse(requestBodyBuffer);

        await t
            .expect(requestBody.details.threeDSResult)
            .ok()
            .expect(requestBody.paymentData)
            .notOk();

        // Check the value of the alert text
        const history = await t.getNativeDialogHistory();
        await t.expect(history[0].text).eql('Authorised');
    });

    test('Fill in card number that will trigger challenge-only flow  with challenge window size set in the call to handleAction', async t => {
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

        // Check challenge window size is read from config prop set in handleAction call
        await t.expect(Selector('.adyen-checkout__threeds2__challenge--01').exists).ok();

        // Complete challenge
        await fillChallengeField(t);
        await submitChallenge(t);

        await t
            // Allow time for the ONLY details call, which we expect to be successful
            .wait(2000)
            .expect(logger.contains(r => r.request.url.indexOf('/details') > -1 && r.response.statusCode === 200))
            .ok()
            .wait(2000);

        // Check the value of the alert text
        const history = await t.getNativeDialogHistory();
        await t.expect(history[0].text).eql('Authorised');
    });
} else {
    test(`Skip testing new 3DS2 flow (handleAction) since api version is too low (v${apiVersion})`, async t => {
        await t.wait(250);
    });
}
