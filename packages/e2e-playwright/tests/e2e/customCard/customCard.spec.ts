import { test, expect } from '../../../fixtures/customCard/customCard.fixture';
import { PAYMENT_RESULT, REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../utils/constants';

test.describe('Custom Card - Standard flow', () => {
    test('should fill in card fields and complete the payment', async ({ customCardPage }) => {
        await customCardPage.typeCardNumber(REGULAR_TEST_CARD);
        await customCardPage.typeExpiryDate(TEST_DATE_VALUE);
        await customCardPage.typeCvc(TEST_CVC_VALUE);
        await customCardPage.pay();

        expect(await customCardPage.paymentResult).toContain(PAYMENT_RESULT.authorised);
    });
});
