import { test, expect } from '../../../fixtures/card.fixture';
import { PAYMENT_RESULT, REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../utils/constants';
import { URL_MAP } from '../../../fixtures/URL_MAP';

test.describe('Card - Standard flow', () => {
    test('#1 Should fill in card fields and complete the payment', async ({ card }) => {
        await card.goto(URL_MAP.card);
        await card.typeCardNumber(REGULAR_TEST_CARD);
        await card.typeCvc(TEST_CVC_VALUE);
        await card.typeExpiryDate(TEST_DATE_VALUE);
        await card.pay();

        await expect(card.paymentResult).toContainText(PAYMENT_RESULT.authorised);
    });
});
