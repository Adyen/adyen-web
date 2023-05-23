import { test, expect } from '../../pages/customCard/customCard.fixture';
import { REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../utils/constants';

test('should fill in card fields and complete the payment', async ({ customCardPage }) => {
    const { card, page } = customCardPage;

    await card.typeCardNumber(REGULAR_TEST_CARD);

    await card.typeExpiryDate(TEST_DATE_VALUE);

    await card.typeCvc(TEST_CVC_VALUE);

    await customCardPage.pay();

    await expect(page.locator('#result-message')).toHaveText('Authorised');
});
