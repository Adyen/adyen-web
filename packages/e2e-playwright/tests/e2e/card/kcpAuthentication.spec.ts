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
        await cardWithKCP.typeCardNumber(KOREAN_TEST_CARD);

        await expect(cardWithKCP.isKoreanBrandVisibleOnPanField()).toBeTruthy();

        await cardWithKCP.typeCvc(TEST_CVC_VALUE);
        await cardWithKCP.typeExpiryDate(TEST_DATE_VALUE);

        await cardWithKCP.typeTaxNumber(TEST_TAX_NUMBER_VALUE);
        await cardWithKCP.typePassword(TEST_PWD_VALUE);
        await cardWithKCP.pay();

        await expect(cardWithKCP.paymentResult).toContainText(PAYMENT_RESULT.authorised);
    });

    test('should not submit the korea issue card payment', async ({ cardWithKCP }) => {
        await cardWithKCP.goto(URL_MAP.cardWithKcp);
        await cardWithKCP.typeCardNumber(KOREAN_TEST_CARD);

        await expect(cardWithKCP.isKoreanBrandVisibleOnPanField()).toBeTruthy();

        await cardWithKCP.typeCvc(TEST_CVC_VALUE);
        await cardWithKCP.typeExpiryDate(TEST_DATE_VALUE);
        await cardWithKCP.pay();

        await expect(cardWithKCP.taxNumberErrorLocator).toContainText('Invalid Cardholder birthdate or Corporate registration number');
        await expect(cardWithKCP.passwordErrorLocator).toContainText('Enter the password');
    });

    test('should submit the regular non-korean card payment', async ({ cardWithKCP, page }) => {
        await cardWithKCP.goto(URL_MAP.cardWithKcp);
        await cardWithKCP.typeCardNumber(REGULAR_TEST_CARD);
        await cardWithKCP.typeCvc(TEST_CVC_VALUE);
        await cardWithKCP.typeExpiryDate(TEST_DATE_VALUE);
        await cardWithKCP.isPayable();
        await cardWithKCP.pay();

        await expect(cardWithKCP.paymentResult).toContainText(PAYMENT_RESULT.authorised);
    });
});
