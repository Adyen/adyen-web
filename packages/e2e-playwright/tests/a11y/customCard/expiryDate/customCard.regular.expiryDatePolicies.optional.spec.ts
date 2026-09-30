import { test, expect } from '../../../../fixtures/customCard.fixture';
import { REGULAR_TEST_CARD } from '../../../utils/constants';
import { binLookupMock } from '../../../../mocks/binLookup/binLookup.mock';
import { optionalDateAndCvcMock } from '../../../../mocks/binLookup/binLookup.data';

test.describe('Test how Custom Card Component with regular date field handles hidden expiryDate policy', () => {
    test('#2 how securedField responds', async ({ page, customCard }) => {
        await binLookupMock(page, optionalDateAndCvcMock);

        // Expect iframe's expiryDate (& cvc) input fields to have an aria-required attr set to true
        await expect(customCard.expiryDateInput).toHaveAttribute('aria-required', 'true');
        await expect(customCard.cvcInput).toHaveAttribute('aria-required', 'true');

        // Fill number to provoke (mock) binLookup response
        await customCard.typeCardNumber(REGULAR_TEST_CARD);

        // Expect iframe's expiryDate (& cvc) input fields to have an aria-required attr set to false
        await expect(customCard.expiryDateInput).toHaveAttribute('aria-required', 'false');
        await expect(customCard.cvcInput).toHaveAttribute('aria-required', 'false');

        // Clear number and see SF's aria-required reset
        await customCard.deleteCardNumber();

        await expect(customCard.expiryDateInput).toHaveAttribute('aria-required', 'true');
        await expect(customCard.cvcInput).toHaveAttribute('aria-required', 'true');
    });
});
