import { expect, test } from '../../../fixtures/card.fixture';
import { URL_MAP } from '../../../fixtures/URL_MAP';
import {
    KOREAN_TEST_CARD,
    PAYMENT_RESULT,
    REGULAR_TEST_CARD,
    TEST_CVC_VALUE,
    TEST_DATE_VALUE,
    TEST_PWD_VALUE,
    TEST_TAX_NUMBER_VALUE
} from '../../utils/constants';

test.describe('Card payments with KCP enabled feature', () => {
    test('should submit the korea issue card payment', async ({ cardWithKCP }) => {
        await cardWithKCP.goto(URL_MAP.cardWithKcp);
        await cardWithKCP.fillCardNumber(KOREAN_TEST_CARD);
        await cardWithKCP.cardNumberKoreanBrand.waitFor({ state: 'visible' });
        await cardWithKCP.fillCvc(TEST_CVC_VALUE);
        await cardWithKCP.fillExpiryDate(TEST_DATE_VALUE);
        await cardWithKCP.taxNumberInput.fill(TEST_TAX_NUMBER_VALUE);
        await cardWithKCP.passwordInput.fill(TEST_PWD_VALUE);
        await cardWithKCP.pay();
        await expect(cardWithKCP.paymentResult).toContainText(PAYMENT_RESULT.authorised);
    });

    test('should not submit the korea issue card payment', async ({ cardWithKCP }) => {
        await cardWithKCP.goto(URL_MAP.cardWithKcp);
        await cardWithKCP.fillCardNumber(KOREAN_TEST_CARD);
        await cardWithKCP.cardNumberKoreanBrand.waitFor({ state: 'visible' });
        await cardWithKCP.fillCvc(TEST_CVC_VALUE);
        await cardWithKCP.fillExpiryDate(TEST_DATE_VALUE);
        await cardWithKCP.pay();
        await expect(cardWithKCP.taxNumberErrorLocator).toContainText('Invalid Cardholder birthdate or Corporate registration number');
        await expect(cardWithKCP.passwordErrorLocator).toContainText('Enter the password');
    });

    test('should submit the regular non-korean card payment', async ({ cardWithKCP, page }) => {
        await cardWithKCP.goto(URL_MAP.cardWithKcp);
        await cardWithKCP.fillCardNumber(REGULAR_TEST_CARD);
        await cardWithKCP.fillCvc(TEST_CVC_VALUE);
        await cardWithKCP.fillExpiryDate(TEST_DATE_VALUE);
        await cardWithKCP.isPayable();
        await cardWithKCP.pay();
        await expect(cardWithKCP.paymentResult).toContainText(PAYMENT_RESULT.authorised);
    });
});
