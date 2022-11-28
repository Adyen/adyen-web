import { test, expect } from '../../pages/cards/card.fixture';
import { REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../utils/constants';

test('should fill in card fields and complete the payment', async ({ cardPage }) => {
    const { card, page } = cardPage;

    await card.typeCardNumber(REGULAR_TEST_CARD);
    await card.typeCvc(TEST_CVC_VALUE);
    await card.typeExpiryDate(TEST_DATE_VALUE);

    await cardPage.pay();

    await expect(page.locator('#result-message')).toHaveText('Authorised');
});
