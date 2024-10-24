import dotenv from 'dotenv';
import { test, testCardInDropin, expect } from '../../../../fixtures/dropin/dropin.fixture';
import { PAYMENT_RESULT, REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../../utils/constants';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { getStoryUrl } from '../../../utils/getStoryUrl';
dotenv.config();
const apiVersion = Number(process.env.API_VERSION.substring(1));

testCardInDropin('#1 Should succeed in making a payment', async ({ dropinPageWithSession, cardPage }) => {
    await dropinPageWithSession.goto(URL_MAP.dropinWithSession);
    await dropinPageWithSession.selectPaymentMethod('scheme');
    await cardPage.isComponentVisible();
    await cardPage.typeCardNumber(REGULAR_TEST_CARD);
    await cardPage.typeExpiryDate(TEST_DATE_VALUE);
    await cardPage.typeCvc(TEST_CVC_VALUE);
    await dropinPageWithSession.pay();

    expect(await dropinPageWithSession.paymentResult).toContain(PAYMENT_RESULT.success);
});

if (apiVersion >= 70) {
    testCardInDropin(
        '#2 Should succeed in making a zeroAuth payment since there is no conflicting configuration on the session',
        async ({ dropinPageWithSession, cardPage }) => {
            const componentConfig = {
                paymentMethodsConfiguration: {
                    card: {
                        _disableClickToPay: true
                    }
                }
            };

            await dropinPageWithSession.goto(getStoryUrl({ baseUrl: URL_MAP.dropinSessions_zeroAuthCard_success, componentConfig }));
            await dropinPageWithSession.selectPaymentMethod('scheme');

            await cardPage.isComponentVisible();
            await cardPage.typeCardNumber(REGULAR_TEST_CARD);
            await cardPage.typeExpiryDate(TEST_DATE_VALUE);
            await cardPage.typeCvc(TEST_CVC_VALUE);

            // A payment successfully registered as a zero-auth payment should have a "save details" button instead of "pay"
            await dropinPageWithSession.saveDetails();

            expect(await dropinPageWithSession.paymentResult).toContain(PAYMENT_RESULT.detailsSaved);
        }
    );

    testCardInDropin(
        '#3 Should fail in making a zeroAuth payment since there is conflicting configuration on the session',
        async ({ dropinPageWithSession, cardPage }) => {
            const componentConfig = {
                paymentMethodsConfiguration: {
                    card: {
                        _disableClickToPay: true
                    }
                }
            };
            await dropinPageWithSession.goto(getStoryUrl({ baseUrl: URL_MAP.dropinSessions_zeroAuthCard_fail, componentConfig }));
            await dropinPageWithSession.selectPaymentMethod('scheme');
            await cardPage.isComponentVisible();
            await cardPage.typeCardNumber(REGULAR_TEST_CARD);
            await cardPage.typeExpiryDate(TEST_DATE_VALUE);
            await cardPage.typeCvc(TEST_CVC_VALUE);

            // A payment successfully registered as a zero-auth payment should have a "save details" button instead of "pay"
            await dropinPageWithSession.saveDetails();

            expect(await dropinPageWithSession.paymentResult).toContain(PAYMENT_RESULT.fail);
        }
    );
} else {
    test(`Skipping tests #2 & #3 for Dropin Sessions flow since api version is too low (v${apiVersion})`, async t => {});
}
