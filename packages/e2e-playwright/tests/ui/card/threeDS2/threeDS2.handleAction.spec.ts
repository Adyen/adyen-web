import { test } from '@playwright/test';

const cardSelector = '.adyen-checkout__payment-method--scheme';
const detailsURL = `/details`;
const submitThreeDS2FingerprintURL = `https://checkoutshopper-test.adyen.com/checkoutshopper/v1/submitThreeDS2Fingerprint?token=${process.env.CLIENT_KEY}`;

// const logger = RequestLogger(
//     [
//         { url: detailsURL, method: 'post' },
//         { url: submitThreeDS2FingerprintURL, method: 'post' }
//     ],
//     {
//         logRequestBody: true,
//         logResponseHeaders: true,
//         logResponseBody: true
//     }
// );

const apiVersion = Number(process.env.API_VERSION.substring(1));

test.describe('Testing new (v67) 3DS2 Flow (custom challengeWindowSize config)', () => {
    test.beforeEach(async () => {
        // await t.navigateTo(dropinPage.pageUrl);
        // await turnOffSDKMocking();
        // use threeDS2.handleAction.clientScripts.js
        // requestHooks(logger) or the playwright equivalent
    });

    test('#1 Fill in card number that will trigger full flow (fingerprint & challenge) with challenge window size set in the component configuration', async () => {
        // logger.clear();
        //
        // await dropinPage.cc.numSpan();
        //
        // // Set handler for the alert window
        // await t.setNativeDialogHandler(() => true);
        //
        // // Fill card fields
        // await dropinPage.cc.cardUtils.fillCardNumber(t, THREEDS2_FULL_FLOW_CARD);
        // await dropinPage.cc.cardUtils.fillDateAndCVC(t);
        //
        // // Expect card to now be valid
        // await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(true);
        //
        // // Click pay
        // await t
        //     .click(dropinPage.cc.payButton)
        //     // Expect no errors
        //     .expect(dropinPage.cc.numLabelTextError.exists)
        //     .notOk()
        //     /**
        //      *  Allow time for the /submitThreeDS2Fingerprint call, which we expect to be successful
        //      */
        //     .wait(2000)
        //     .expect(logger.contains(r => r.request.url.indexOf('/submitThreeDS2Fingerprint') > -1 && r.response.statusCode === 200))
        //     .ok();
        //
        // //        console.log('logger.requests[0].response', logger.requests[0].response);
        //
        // // Check challenge window size is read from config prop set in handleAction call
        // await t.expect(dropinPage.challengeWindowSize04.exists).ok({ timeout: 3000 });
        //
        // // Complete challenge
        // await fillChallengeField(t);
        // await submitChallenge(t);
        //
        // await t
        //     // Allow time for the /details call, which we expect to be successful
        //     .wait(2000)
        //     .expect(logger.contains(r => r.request.url.indexOf('/details') > -1 && r.response.statusCode === 200))
        //     .ok()
        //     .wait(3000);
        //
        // // Check request body is in the expected form
        // const requestBodyBuffer = logger.requests[1].request.body;
        // const requestBody = JSON.parse(requestBodyBuffer);
        //
        // await t.expect(requestBody.details.threeDSResult).ok().expect(requestBody.paymentData).notOk();
        //
        // // Check the value of the alert text
        // const history = await t.getNativeDialogHistory();
        // await t.expect(history[0].text).eql('Authorised');
    });

    test('#2 Fill in card number that will trigger challenge-only flow  with challenge window size set in component configuration', async () => {
        // logger.clear();
        //
        // await dropinPage.cc.numSpan();
        //
        // // Set handler for the alert window
        // await t.setNativeDialogHandler(() => true);
        //
        // // Fill card fields
        // await dropinPage.cc.cardUtils.fillCardNumber(t, THREEDS2_CHALLENGE_ONLY_CARD);
        // await dropinPage.cc.cardUtils.fillDateAndCVC(t);
        //
        // // Expect card to now be valid
        // await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(true);
        //
        // // Click pay
        // await t.click(dropinPage.cc.payButton);
        //
        // // Check challenge window size is read from config prop set in handleAction call
        // await t.expect(dropinPage.challengeWindowSize04.exists).ok({ timeout: 3000 });
        //
        // // Complete challenge
        // await fillChallengeField(t);
        // await submitChallenge(t);
        //
        // await t
        //     // Allow time for the ONLY details call, which we expect to be successful
        //     .wait(2000)
        //     .expect(logger.contains(r => r.request.url.indexOf('/details') > -1 && r.response.statusCode === 200))
        //     .ok()
        //     .wait(3000);
        //
        // // Check the value of the alert text
        // const history = await t.getNativeDialogHistory();
        // await t.expect(history[0].text).eql('Authorised');
    });
});
