import { expect, test } from '../../../../fixtures/card.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import {
    KOREAN_TEST_CARD,
    PAYMENT_RESULT,
    REGULAR_TEST_CARD,
    TEST_CVC_VALUE,
    TEST_DATE_VALUE,
    TEST_PWD_VALUE,
    TEST_TAX_NUMBER_VALUE
} from '../../../utils/constants';
import { getStoryUrl } from '../../../utils/getStoryUrl';
import { paymentSuccessfulMock } from '../../../../mocks/payments/payments.mock';

test.describe('Card with KCP fields', () => {
    test.describe('Displaying KCP fields by default', () => {
        test('should hide KCP fields if Card is not korean and make the payment', async ({ cardWithKCP }) => {
            await cardWithKCP.goto(URL_MAP.cardWithKcp);
            await cardWithKCP.typeCardNumber(REGULAR_TEST_CARD);

            await expect(cardWithKCP.passwordInput).not.toBeVisible();
            await expect(cardWithKCP.taxNumberInput).not.toBeVisible();

            await cardWithKCP.typeCvc(TEST_CVC_VALUE);
            await cardWithKCP.typeExpiryDate(TEST_DATE_VALUE);
            await cardWithKCP.pay();

            await expect(cardWithKCP.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });

        test('should hide KCP fields if Card is not korean, then show them again once the Card is replaced by korean card and make the payment', async ({
            cardWithKCP,
            page
        }) => {
            await paymentSuccessfulMock(page);
            const paymentsRequestPromise = page.waitForRequest(request => request.url().includes('/payments') && request.method() === 'POST');

            await cardWithKCP.goto(URL_MAP.cardWithKcp);
            await cardWithKCP.typeCardNumber(REGULAR_TEST_CARD);

            await expect(cardWithKCP.passwordInput).not.toBeVisible();
            await expect(cardWithKCP.taxNumberInput).not.toBeVisible();

            await cardWithKCP.deleteCardNumber();

            await cardWithKCP.typeCardNumber(KOREAN_TEST_CARD);
            await cardWithKCP.typeCvc(TEST_CVC_VALUE);
            await cardWithKCP.typeExpiryDate(TEST_DATE_VALUE);
            await cardWithKCP.typeTaxNumber(TEST_TAX_NUMBER_VALUE);
            await cardWithKCP.typePassword(TEST_PWD_VALUE);
            await cardWithKCP.pay();

            // Check that KCP fields are passed in
            const request = await paymentsRequestPromise;
            const paymentMethod = await request.postDataJSON().paymentMethod;
            expect(paymentMethod.encryptedPassword).not.toBeNull();
            expect(paymentMethod.taxNumber).not.toBeNull();

            await expect(cardWithKCP.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });
        test('should fill in KCP fields, then replace with non-korean Card and make a payment (seeing that kcp info has been cleared from card state)', async ({
            cardWithKCP,
            page
        }) => {
            await paymentSuccessfulMock(page);
            const paymentsRequestPromise = page.waitForRequest(request => request.url().includes('/payments') && request.method() === 'POST');

            await cardWithKCP.goto(URL_MAP.cardWithKcp);

            await cardWithKCP.typeCardNumber(KOREAN_TEST_CARD);
            await cardWithKCP.typeCvc(TEST_CVC_VALUE);
            await cardWithKCP.typeExpiryDate(TEST_DATE_VALUE);
            await cardWithKCP.typeTaxNumber(TEST_TAX_NUMBER_VALUE);
            await cardWithKCP.typePassword(TEST_PWD_VALUE);

            await cardWithKCP.deleteCardNumber();
            await cardWithKCP.typeCardNumber(REGULAR_TEST_CARD);

            await expect(cardWithKCP.passwordInput).not.toBeVisible();
            await expect(cardWithKCP.taxNumberInput).not.toBeVisible();

            await cardWithKCP.pay();

            // Check that KCP fields are NOT passed in
            const request = await paymentsRequestPromise;
            const paymentMethod = await request.postDataJSON().paymentMethod;
            expect(paymentMethod.encryptedPassword).toBeUndefined();
            expect(paymentMethod.taxNumber).toBeUndefined();

            await expect(cardWithKCP.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });
    });

    test.describe('Displaying KCP fields once Korean card is detected', () => {
        const url = getStoryUrl({
            baseUrl: URL_MAP.card,
            componentConfig: {
                brands: ['mc', 'visa', 'amex', 'korean_local_card'],
                configuration: {
                    koreanAuthenticationRequired: true
                }
            }
        });

        test('should display KCP fields once korean card is entered and make the payment', async ({ cardWithKCP, page }) => {
            await paymentSuccessfulMock(page);

            await cardWithKCP.goto(url);

            await expect(cardWithKCP.passwordInput).not.toBeVisible();
            await expect(cardWithKCP.taxNumberInput).not.toBeVisible();

            await cardWithKCP.typeCardNumber(KOREAN_TEST_CARD);

            await expect(cardWithKCP.passwordInput).toBeVisible();
            await expect(cardWithKCP.taxNumberInput).toBeVisible();

            await cardWithKCP.typeCvc(TEST_CVC_VALUE);
            await cardWithKCP.typeExpiryDate(TEST_DATE_VALUE);
            await cardWithKCP.typeTaxNumber(TEST_TAX_NUMBER_VALUE);
            await cardWithKCP.typePassword(TEST_PWD_VALUE);
            await cardWithKCP.pay();

            await expect(cardWithKCP.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });

        test('should display KCP fields once korean card is entered, then replace by regular Card and make the payment', async ({ cardWithKCP }) => {
            await cardWithKCP.goto(url);

            await cardWithKCP.typeCardNumber(KOREAN_TEST_CARD);

            await expect(cardWithKCP.passwordInput).toBeVisible();
            await expect(cardWithKCP.taxNumberInput).toBeVisible();

            await cardWithKCP.deleteCardNumber();

            await cardWithKCP.typeCardNumber(REGULAR_TEST_CARD);
            await cardWithKCP.typeCvc(TEST_CVC_VALUE);
            await cardWithKCP.typeExpiryDate(TEST_DATE_VALUE);

            await expect(cardWithKCP.passwordInput).not.toBeVisible();
            await expect(cardWithKCP.taxNumberInput).not.toBeVisible();

            await cardWithKCP.pay();

            await expect(cardWithKCP.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });

        test('should apply validation to KCP fields', async ({ cardWithKCP }) => {
            await cardWithKCP.goto(url);

            await cardWithKCP.typeCardNumber(KOREAN_TEST_CARD);
            await cardWithKCP.typeCvc(TEST_CVC_VALUE);
            await cardWithKCP.typeExpiryDate(TEST_DATE_VALUE);
            await cardWithKCP.pay();

            await expect(cardWithKCP.taxNumberErrorLocator).toHaveText('Invalid Cardholder birthdate or Corporate registration number');
            await expect(cardWithKCP.passwordErrorLocator).toHaveText('Enter the password');
        });
    });
});
