const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') });

import { RequestLogger } from 'testcafe';
import { fillChallengeField, submitChallenge } from '../utils/threeDS2Utils';
import { THREEDS2_CHALLENGE_ONLY_CARD, THREEDS2_FRICTIONLESS_CARD, THREEDS2_FULL_FLOW_CARD } from '../utils/constants';
import { BASE_URL } from '../../pages';
import DropinPage from '../../_models/Dropin.page';
import CardComponentPage from '../../_models/CardComponent.page';
import { turnOffSDKMocking } from '../../_common/cardMocks';

const dropinPage = new DropinPage({
    components: {
        cc: new CardComponentPage('.adyen-checkout__payment-method--card')
    }
});

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

fixture`Testing new (v67) 3DS2 Flow`
    .beforeEach(async t => {
        await t.navigateTo(dropinPage.pageUrl);
        await turnOffSDKMocking();
    })
    .clientScripts('threeDS2.clientScripts.js')
    .requestHooks(logger);

test('#1 Fill in card number that will trigger frictionless flow', async t => {
    await dropinPage.cc.numSpan();

    // Set handler for the alert window
    await t.setNativeDialogHandler(() => true);

    // Fill card fields
    await dropinPage.cc.cardUtils.fillCardNumber(t, THREEDS2_FRICTIONLESS_CARD, 'paste');
    await dropinPage.cc.cardUtils.fillDateAndCVC(t);

    // Expect card to now be valid
    await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(true);

    // Click pay
    await t
        .click(dropinPage.cc.payButton)
        // Allow time for the ONLY details call, which we expect to be successful
        .expect(logger.contains(r => r.request.url.indexOf('/details') > -1 && r.response.statusCode === 200))
        .ok({ timeout: 10000 })
        // Allow time for the alert to manifest
        .wait(2000);

    // Check the value of the alert text
    const history = await t.getNativeDialogHistory();
    await t.expect(history[0].text).eql('Authorised');
});

test('#2 Fill in card number that will trigger full flow (fingerprint & challenge)', async t => {
    logger.clear();

    await dropinPage.cc.numSpan();

    // Set handler for the alert window
    await t.setNativeDialogHandler(() => true);

    // Fill card fields
    await dropinPage.cc.cardUtils.fillCardNumber(t, THREEDS2_FULL_FLOW_CARD, 'paste');
    await dropinPage.cc.cardUtils.fillDateAndCVC(t);

    // Expect card to now be valid
    await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(true);

    // Click pay
    await t
        .click(dropinPage.cc.payButton)
        /**
         *  Allow time for the /submitThreeDS2Fingerprint call, which we expect to be successful
         */
        .expect(logger.contains(r => r.request.url.indexOf('/submitThreeDS2Fingerprint') > -1 && r.response.statusCode === 200))
        .ok({ timeout: 10000 });

    //        console.log('logger.requests[0].response', logger.requests[0].response);

    // Check challenge window size is read from config prop
    await t.expect(dropinPage.challengeWindowSize04.exists).ok({ timeout: 3000 });

    // Complete challenge
    await fillChallengeField(t);
    await submitChallenge(t);

    await t
        // Allow time for the /details call, which we expect to be successful
        .expect(logger.contains(r => r.request.url.indexOf('/details') > -1 && r.response.statusCode === 200))
        .ok({ timeout: 10000 })
        .wait(1000);

    // Check request body is in the expected form
    const requestBodyBuffer = logger.requests[1].request.body;
    const requestBody = JSON.parse(requestBodyBuffer);

    await t.expect(requestBody.details.threeDSResult).ok().expect(requestBody.paymentData).notOk();

    // Check the value of the alert text
    const history = await t.getNativeDialogHistory();
    await t.expect(history[0].text).eql('Authorised');
});

test('#3 Fill in card number that will trigger challenge-only flow', async t => {
    logger.clear();

    await dropinPage.cc.numSpan();

    // Set handler for the alert window
    await t.setNativeDialogHandler(() => true);

    // Fill card fields
    await dropinPage.cc.cardUtils.fillCardNumber(t, THREEDS2_CHALLENGE_ONLY_CARD, 'paste');
    await dropinPage.cc.cardUtils.fillDateAndCVC(t);

    // Expect card to now be valid
    //        await t.expect(getIsValid('dropin')).eql(true);
    await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(true);

    // Click pay
    await t.click(dropinPage.cc.payButton);

    // Check challenge window size is read from config prop
    await t.expect(dropinPage.challengeWindowSize04.exists).ok({ timeout: 3000 });

    // Complete challenge
    await fillChallengeField(t);
    await submitChallenge(t);

    await t
        // Allow time for the ONLY details call, which we expect to be successful
        .expect(logger.contains(r => r.request.url.indexOf('/details') > -1 && r.response.statusCode === 200))
        .ok({ timeout: 10000 })
        .wait(2000);

    // Check the value of the alert text
    const history = await t.getNativeDialogHistory();
    await t.expect(history[0].text).eql('Authorised');
});
