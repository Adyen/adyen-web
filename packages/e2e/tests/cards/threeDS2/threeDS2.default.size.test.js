import { turnOffSDKMocking } from '../../_common/cardMocks';

const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') }); // 2 dirs up, apparently!

import CardComponentPage from '../../_models/CardComponent.page';
import { RequestLogger } from 'testcafe';
import { fillChallengeField, submitChallenge } from '../utils/threeDS2Utils';
import { THREEDS2_CHALLENGE_ONLY_CARD, THREEDS2_FULL_FLOW_CARD } from '../utils/constants';
import { BASE_URL } from '../../pages';

const cardPage = new CardComponentPage();

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

fixture`Testing default size of the 3DS2 challenge window, & the challenge flows, on the Card component, since all other tests are for Dropin`
    .beforeEach(async t => {
        await t.navigateTo(cardPage.pageUrl);
        await turnOffSDKMocking();
    })
    .clientScripts('./threeDS2.default.size.clientScripts.js')
    .requestHooks([loggerDetails, loggerSubmitThreeDS2]);

test('#1 Fill in card number that will trigger full flow (fingerprint & challenge)', async t => {
    loggerDetails.clear();

    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Set handler for the alert window
    await t.setNativeDialogHandler(() => true);

    // Fill card fields
    await cardPage.cardUtils.fillCardNumber(t, THREEDS2_FULL_FLOW_CARD);
    await cardPage.cardUtils.fillDateAndCVC(t);

    // Expect card to now be valid
    await t.expect(cardPage.getFromState('isValid')).eql(true);

    // Click pay
    await t
        .click(cardPage.payButton)
        // Expect no errors
        .expect(cardPage.numLabelTextError.exists)
        .notOk()
        .expect(loggerSubmitThreeDS2.contains(r => r.response.statusCode === 200))
        // Allow time for the /submitThreeDS2Fingerprint call, which we expect to be successful
        .ok({ timeout: 5000 });

    // console.log(logger.requests[0].response.headers);

    // Check challenge window size is read from default config prop
    await t.expect(cardPage.challengeWindowSize02.exists).ok({ timeout: 5000 });

    // Complete challenge
    await fillChallengeField(t);
    await submitChallenge(t);

    await t
        .expect(loggerDetails.contains(r => r.response.statusCode === 200))
        // Allow time for the /details call, which we expect to be successful
        .ok({ timeout: 5000 })
        .wait(1000);

    // console.log(logger.requests[1].response.headers);

    // Check the value of the alert text
    const history = await t.getNativeDialogHistory();
    await t.expect(history[0].text).eql('Authorised', { timeout: 5000 });
});

test('#2 Fill in card number that will trigger challenge-only flow', async t => {
    loggerDetails.clear();

    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Set handler for the alert window
    await t.setNativeDialogHandler(() => true);

    // Fill card fields
    await cardPage.cardUtils.fillCardNumber(t, THREEDS2_CHALLENGE_ONLY_CARD);
    await cardPage.cardUtils.fillDateAndCVC(t);

    // Expect card to now be valid
    await t.expect(cardPage.getFromState('isValid')).eql(true);

    // Click pay
    await t.click(cardPage.payButton);

    // Check challenge window size is read from config prop
    await t.expect(cardPage.challengeWindowSize02.exists).ok({ timeout: 5000 });

    // Complete challenge
    await fillChallengeField(t);
    await submitChallenge(t);

    await t
        .expect(loggerDetails.contains(r => r.response.statusCode === 200))
        // Allow time for the ONLY details call, which we expect to be successful
        .ok({ timeout: 5000 })
        .wait(2000);

    // Check the value of the alert text
    const history = await t.getNativeDialogHistory();
    await t.expect(history[0].text).eql('Authorised', { timeout: 5000 });
});
