/**
 * NOTE: the difference between the old and new flow is that ThreeDS2DeviceFingerprint.tsx calls /submitThreeDS2Fingerprint rather than /details as
 *  its onComplete function and ThreeDS2/components/get-query-parameters.ts has to provide the createFingerprintResolveData & createChallengeResolveData functions
 *  that will prepare the data in a way acceptable to the /submitThreeDS2Fingerprint endpoint
 */

const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') }); // 2 dirs up, apparently!

import DropinPage from '../../_models/Dropin.page';
import { turnOffSDKMocking } from '../../_common/cardMocks';
import { Selector, RequestLogger } from 'testcafe';
import { THREEDS2_FULL_FLOW_CARD } from '../utils/constants';
import CardComponentPage from '../../_models/CardComponent.page';

const dropinPage = new DropinPage({
    components: {
        cc: new CardComponentPage('.adyen-checkout__payment-method--card')
    }
});

const url = `https://checkoutshopper-test.adyen.com/checkoutshopper/v1/submitThreeDS2Fingerprint?token=${process.env.CLIENT_KEY}`;

const logger = RequestLogger(
    { url, method: 'post' },
    {
        logResponseHeaders: true,
        logResponseBody: true
    }
);

const apiVersion = Number(process.env.API_VERSION.substr(1));

// This "3DS1 fallback" has been deprecated and is now only available in a limited number of countries // TODO confirm
fixture.skip`Testing new (v67) 3DS2 Flow (redirect)`
    .beforeEach(async t => {
        await t.navigateTo(`${dropinPage.pageUrl}?amount=12003`);
        await turnOffSDKMocking();
    })
    .clientScripts('threeDS2.clientScripts.js')
    .requestHooks(logger);

if (apiVersion >= 67) {
    test('Fill in card number that will trigger redirect flow', async t => {
        await dropinPage.cc.numSpan();

        // Set handler for the alert window
        await t.setNativeDialogHandler(() => true);

        // Fill card fields
        await dropinPage.cc.cardUtils.fillCardNumber(t, THREEDS2_FULL_FLOW_CARD);
        await dropinPage.cc.cardUtils.fillDateAndCVC(t);

        // Expect card to now be valid
        await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(true);

        // Click pay
        await t
            .click(dropinPage.cc.payButton)
            // Expect no errors
            .expect(dropinPage.cc.numLabelTextError.exists)
            .notOk()
            // Allow time for the ONLY /submitThreeDS2Fingerprint call, which we expect to be successful
            .expect(logger.contains(r => r.response.statusCode === 200))
            .ok({ timeout: 10000 })
            // Allow time for redirect to occur
            .wait(2000);

        // Inspect page for Redirect elements
        await t.expect(Selector('title').innerText).eql('3D Authentication Host');
    });
} else {
    test(`Skip testing new 3DS2 redirect flow since api version is too low (v${apiVersion})`, async t => {
        await t.wait(250);
    });
}
