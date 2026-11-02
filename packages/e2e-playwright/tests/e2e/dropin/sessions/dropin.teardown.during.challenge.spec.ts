import { test, expect } from '../../../../fixtures/dropin.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { Card } from '../../../../models/card';
import { DropinWithSession } from '../../../../models/dropinWithSession';
import { PAYMENT_RESULT, TEST_CVC_VALUE, TEST_DATE_VALUE, THREEDS2_CHALLENGE_PASSWORD, THREEDS2_FULL_FLOW_CARD } from '../../../utils/constants';

test.describe('Dropin - 3DS2 - sibling instance torn down mid-challenge', () => {
    test('should not trigger a duplicate /paymentDetails call when a sibling Drop-in instance was torn down outside of Preact', async ({ page }) => {
        const detailsRequestUrls: string[] = [];
        page.on('request', request => {
            if (request.url().includes('/paymentDetails')) {
                detailsRequestUrls.push(request.url());
            }
        });

        const dropin1 = new DropinWithSession(page, '#component-root-1 .adyen-checkout__dropin');
        const dropin2 = new DropinWithSession(page, '#component-root-2 .adyen-checkout__dropin');

        await dropin1.goto(URL_MAP.dropin_twoInstances_executeThreeD);
        await dropin2.isComponentVisible();
        dropin2.setPaymentMethods(dropin1.paymentMethods, dropin1.storedPaymentMethods);

        // Instance #1: drive it far enough that its 3DS2 challenge iframe mounts (the postMessage
        // listener in DoChallenge3DS2 is now registered), but never complete the challenge
        const { paymentMethodDetailsLocator: pm1 } = await dropin1.selectNonStoredPaymentMethod('scheme');
        const card1 = new Card(page, pm1);
        await card1.isComponentVisible();
        await card1.typeCardNumber(THREEDS2_FULL_FLOW_CARD);
        await card1.typeCvc(TEST_CVC_VALUE);
        await card1.typeExpiryDate(TEST_DATE_VALUE);
        await dropin1.pay();
        await card1.threeDs2Challenge.rootElement.waitFor({ state: 'visible' });

        // Simulate instance #1 being torn down incorrectly - bypassing Preact's unmount lifecycle,
        // so componentWillUnmount (and its window.removeEventListener) never runs
        await page.evaluate(() => {
            document.getElementById('component-root-1').innerHTML = '';
        });

        // Instance #2: complete a full 3DS2 (fingerprint & challenge) flow normally
        const { paymentMethodDetailsLocator: pm2 } = await dropin2.selectNonStoredPaymentMethod('scheme');
        const card2 = new Card(page, pm2);
        await card2.isComponentVisible();
        await card2.typeCardNumber(THREEDS2_FULL_FLOW_CARD);
        await card2.typeCvc(TEST_CVC_VALUE);
        await card2.typeExpiryDate(TEST_DATE_VALUE);
        await dropin2.pay();
        await card2.threeDs2Challenge.fillInPassword(THREEDS2_CHALLENGE_PASSWORD);
        await card2.threeDs2Challenge.submit();

        await expect(dropin2.paymentResult).toContainText(PAYMENT_RESULT.success);
        // Without DoChallenge3DS2's isDetachedFromDOM guard, instance #1's stale listener also
        // resolves on instance #2's postMessage, causing a second /paymentDetails call
        expect(detailsRequestUrls).toHaveLength(1);
    });
});
