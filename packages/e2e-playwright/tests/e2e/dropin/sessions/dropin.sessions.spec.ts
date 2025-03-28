import dotenv from 'dotenv';
import { test, expect } from '../../../../fixtures/dropin.fixture';
import { PAYMENT_RESULT, REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../../utils/constants';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { Card } from '../../../../models/card';

dotenv.config();
const apiVersion = Number(process.env.API_VERSION.substring(1));

test('#1 Should succeed in making a payment', async ({ dropinWithSession, page }) => {
    await dropinWithSession.goto(URL_MAP.dropinWithSession);
    const { paymentMethodDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');

    const card = new Card(page, paymentMethodDetailsLocator);

    await card.isComponentVisible();
    await card.typeCardNumber(REGULAR_TEST_CARD);
    await card.typeExpiryDate(TEST_DATE_VALUE);
    await card.typeCvc(TEST_CVC_VALUE);

    await dropinWithSession.pay();

    await expect(dropinWithSession.paymentResult).toContainText(PAYMENT_RESULT.success);
});

if (apiVersion >= 70) {
    test('#2 Should succeed in making a zeroAuth payment since there is no conflicting configuration on the session', async ({
        dropinWithSession,
        page
    }) => {
        await dropinWithSession.goto(URL_MAP.dropinSessions_zeroAuthCard_success);
        const { paymentMethodDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');

        const card = new Card(page, paymentMethodDetailsLocator);

        await card.isComponentVisible();
        await card.typeCardNumber(REGULAR_TEST_CARD);
        await card.typeExpiryDate(TEST_DATE_VALUE);
        await card.typeCvc(TEST_CVC_VALUE);

        // A payment successfully registered as a zero-auth payment should have a "save details" button instead of "pay"
        await dropinWithSession.saveDetails();

        await expect(dropinWithSession.paymentResult).toContainText(PAYMENT_RESULT.detailsSaved);
    });

    test('#3 Should fail in making a zeroAuth payment since there is conflicting configuration on the session', async ({
        dropinWithSession,
        page
    }) => {
        await dropinWithSession.goto(URL_MAP.dropinSessions_zeroAuthCard_fail);

        const { paymentMethodDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');
        const card = new Card(page, paymentMethodDetailsLocator);

        await card.isComponentVisible();
        await card.typeCardNumber(REGULAR_TEST_CARD);
        await card.typeExpiryDate(TEST_DATE_VALUE);
        await card.typeCvc(TEST_CVC_VALUE);

        // A payment successfully registered as a zero-auth payment should have a "save details" button instead of "pay"
        await dropinWithSession.saveDetails();

        await expect(dropinWithSession.paymentResult).toContainText(PAYMENT_RESULT.fail);
    });
} else {
    test(`Skipping tests #2 & #3 for Dropin Sessions flow since api version is too low (v${apiVersion})`, async t => {});
}
