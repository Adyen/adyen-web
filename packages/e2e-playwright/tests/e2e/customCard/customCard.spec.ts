import { test, expect } from '../../../fixtures/customCard.fixture';
import { PAYMENT_RESULT, REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../utils/constants';

test.describe('Custom Card - Standard flow', () => {
    test('should fill in card fields and complete the payment', async ({ customCard }) => {
        await customCard.typeCardNumber(REGULAR_TEST_CARD);
        await customCard.typeExpiryDate(TEST_DATE_VALUE);
        await customCard.typeCvc(TEST_CVC_VALUE);
        await customCard.pay();
        await expect(customCard.paymentResult).toContainText(PAYMENT_RESULT.authorised);
    });
});
