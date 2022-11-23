import { test, expect } from '../../pages/cards/card.fixture';
import { REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../utils/constants';

test('should fill in card fields and complete the payment', async ({ cardPage, page }) => {
    const { card } = cardPage;

    await card.fillCardNumber(REGULAR_TEST_CARD);
    await card.fillCvcInput(TEST_CVC_VALUE);
    await card.fillExpiryDate(TEST_DATE_VALUE);

    await cardPage.pay();

    await expect(page.locator('#result-message')).toHaveText('Authorised');
});
