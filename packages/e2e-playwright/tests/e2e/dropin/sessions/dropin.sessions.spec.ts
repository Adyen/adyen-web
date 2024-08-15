import dotenv from 'dotenv';
import { test, cardInDropin, expect } from '../../../../fixtures/dropin.fixture';
import { PAYMENT_RESULT, REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../../utils/constants';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
dotenv.config();
const apiVersion = Number(process.env.API_VERSION.substring(1));

cardInDropin('#1 Should succeed in making a payment', async ({ dropinWithSession, card }) => {
    await dropinWithSession.goto(URL_MAP.dropinWithSession);
    await dropinWithSession.selectPaymentMethod('scheme');

    await card.isComponentVisible();
    await card.typeCardNumber(REGULAR_TEST_CARD);
    await card.typeExpiryDate(TEST_DATE_VALUE);
    await card.typeCvc(TEST_CVC_VALUE);

    await dropinWithSession.pay();

    await expect(dropinWithSession.paymentResult).toContainText(PAYMENT_RESULT.success);
});

if (apiVersion >= 70) {
    cardInDropin(
        '#2 Should succeed in making a zeroAuth payment since there is no conflicting configuration on the session',
        async ({ dropinWithSession, card }) => {
            await dropinWithSession.goto(URL_MAP.dropinSessions_zeroAuthCard_success);
            await dropinWithSession.selectPaymentMethod('scheme');

            await card.isComponentVisible();
            await card.typeCardNumber(REGULAR_TEST_CARD);
            await card.typeExpiryDate(TEST_DATE_VALUE);
            await card.typeCvc(TEST_CVC_VALUE);

            // A payment successfully registered as a zero-auth payment should have a "save details" button instead of "pay"
            await dropinWithSession.saveDetails();

            await expect(dropinWithSession.paymentResult).toContainText(PAYMENT_RESULT.detailsSaved);
        }
    );

    cardInDropin(
        '#3 Should fail in making a zeroAuth payment since there is conflicting configuration on the session',
        async ({ dropinWithSession, card }) => {
            await dropinWithSession.goto(URL_MAP.dropinSessions_zeroAuthCard_fail);
            await dropinWithSession.selectPaymentMethod('scheme');
            await card.isComponentVisible();
            await card.typeCardNumber(REGULAR_TEST_CARD);
            await card.typeExpiryDate(TEST_DATE_VALUE);
            await card.typeCvc(TEST_CVC_VALUE);

            // A payment successfully registered as a zero-auth payment should have a "save details" button instead of "pay"
            await dropinWithSession.saveDetails();

            await expect(dropinWithSession.paymentResult).toContainText(PAYMENT_RESULT.fail);
        }
    );
} else {
    test(`Skipping tests #2 & #3 for Dropin Sessions flow since api version is too low (v${apiVersion})`, async t => {});
}
