/**
 * NOTE: the difference between the old and new flow is that ThreeDS2DeviceFingerprint.tsx calls /submitThreeDS2Fingerprint rather than /details as
 *  its onComplete function and ThreeDS2/components/utils.ts has to provide the createFingerprintResolveData & createChallengeResolveData functions
 *  that will prepare the data in a way acceptable to the /submitThreeDS2Fingerprint endpoint
 */

const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') }); // 2 dirs up, apparently!

import { Selector, RequestLogger } from 'testcafe';
import { start, getIframeSelector, getIsValid } from '../../utils/commonUtils';
import cu from '../utils/cardUtils';
import { THREEDS2_FULL_FLOW_CARD } from '../utils/constants';
import { BASE_URL } from '../../pages';

const url = `https://checkoutshopper-test.adyen.com/checkoutshopper/v1/submitThreeDS2Fingerprint?token=${process.env.CLIENT_KEY}`;

const logger = RequestLogger(
    { url, method: 'post' },
    {
        logResponseHeaders: true,
        logResponseBody: true
    }
);

const apiVersion = Number(process.env.API_VERSION.substr(1));

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.adyen-checkout__payment-method--card iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing new (v67) 3DS2 Flow (redirect)`
    .page(`${BASE_URL}?amount=12003`)
    .clientScripts('threeDS2.clientScripts.js')
    .requestHooks(logger);

if (apiVersion >= 67) {
    test('Fill in card number that will trigger redirect flow', async t => {
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
            // Allow time for the ONLY /submitThreeDS2Fingerprint call, which we expect to be successful
            .wait(2000)
            .expect(logger.contains(r => r.response.statusCode === 200))
            .ok()
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
