import { test, expect } from '../../pages/cards/card.fixture';
import { REGULAR_TEST_CARD } from '../utils/constants';
import { binLookupMock } from '../../mocks/binLookup/binLookup.mock';
import { optionalDateAndCvcMock } from '../../mocks/binLookup/binLookup.data';

test.describe('Card - AVS', () => {
    test('should move the focus to the address field since expiryDate & cvc are optional', async ({ cardAvsPage }) => {
        const { cardWithAvs, page } = cardAvsPage;

        await binLookupMock(page, optionalDateAndCvcMock);

        await cardWithAvs.isComponentVisible();

        const firstDigits = REGULAR_TEST_CARD.substring(0, 15);
        const lastDigits = REGULAR_TEST_CARD.substring(15, 16);

        await cardWithAvs.typeCardNumber(firstDigits);
        await cardWithAvs.typeCardNumber(lastDigits);

        await expect(cardWithAvs.billingAddress.addressInput).toBeFocused();
    });
});
