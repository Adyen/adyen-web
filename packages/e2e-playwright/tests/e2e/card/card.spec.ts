import { test, expect } from '../../../fixtures/cards/card.fixture';
import { PAYMENT_RESULT, REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../utils/constants';
import { URL_MAP } from '../../../fixtures/URL_MAP';

test.describe('Card - Standard flow', () => {
    test('#1 Should fill in card fields and complete the payment', async ({ cardPage }) => {
        await cardPage.goto(URL_MAP.card);
        await cardPage.typeCardNumber(REGULAR_TEST_CARD);
        await cardPage.typeCvc(TEST_CVC_VALUE);
        await cardPage.typeExpiryDate(TEST_DATE_VALUE);
        await cardPage.pay();

        expect(await cardPage.paymentResult).toContain(PAYMENT_RESULT.authorised);
    });
});
