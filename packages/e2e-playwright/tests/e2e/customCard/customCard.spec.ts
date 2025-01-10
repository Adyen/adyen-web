import { test, expect } from '../../../fixtures/customCard.fixture';
import { PAYMENT_RESULT, REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE, TEST_MONTH_VALUE, TEST_YEAR_VALUE } from '../../utils/constants';

test.describe('Custom Card - Standard flow', () => {
    test('should fill out the fields in the regular custom card and make a successful payment', async ({ customCard }) => {
        await customCard.typeCardNumber(REGULAR_TEST_CARD);
        await customCard.typeExpiryDate(TEST_DATE_VALUE);
        await customCard.typeCvc(TEST_CVC_VALUE);
        await customCard.pay();
        await expect(customCard.paymentResult).toContainText(PAYMENT_RESULT.authorised);
    });

    test('should fill out the fields in the separate custom card and make a successful payment', async ({ customCardSeparateExpiryDate }) => {
        await customCardSeparateExpiryDate.typeCardNumber(REGULAR_TEST_CARD);
        await customCardSeparateExpiryDate.typeExpiryMonth(TEST_MONTH_VALUE);
        await customCardSeparateExpiryDate.typeExpiryYear(TEST_YEAR_VALUE);
        await customCardSeparateExpiryDate.typeCvc(TEST_CVC_VALUE);
        await customCardSeparateExpiryDate.pay();
        await expect(customCardSeparateExpiryDate.paymentResult).toContainText(PAYMENT_RESULT.authorised);
    });
});
