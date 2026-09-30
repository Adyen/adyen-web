import { test, expect } from '../../../../fixtures/customCard.fixture';
import { REGULAR_TEST_CARD } from '../../../utils/constants';
import { binLookupMock } from '../../../../mocks/binLookup/binLookup.mock';
import { optionalDateAndCvcMock } from '../../../../mocks/binLookup/binLookup.data';

test.describe('Test how Custom Card Component with separate date fields handles hidden expiryDate policy', () => {
    test('#2 how securedField responds', async ({ page, customCardSeparateExpiryDate }) => {
        await binLookupMock(page, optionalDateAndCvcMock);

        // Expect iframe's date (& cvc) input fields to have an aria-required attr set to true
        await expect(customCardSeparateExpiryDate.expiryMonthInput).toHaveAttribute('aria-required', 'true');
        await expect(customCardSeparateExpiryDate.expiryYearInput).toHaveAttribute('aria-required', 'true');
        await expect(customCardSeparateExpiryDate.cvcInput).toHaveAttribute('aria-required', 'true');

        // Fill number to provoke (mock) binLookup response
        await customCardSeparateExpiryDate.typeCardNumber(REGULAR_TEST_CARD);

        // Expect iframe's date (& cvc) input fields to have an aria-required attr set to false
        await expect(customCardSeparateExpiryDate.expiryMonthInput).toHaveAttribute('aria-required', 'false');
        await expect(customCardSeparateExpiryDate.expiryYearInput).toHaveAttribute('aria-required', 'false');
        await expect(customCardSeparateExpiryDate.cvcInput).toHaveAttribute('aria-required', 'false');

        // Clear number and see SF's aria-required reset
        await customCardSeparateExpiryDate.deleteCardNumber();

        await expect(customCardSeparateExpiryDate.expiryMonthInput).toHaveAttribute('aria-required', 'true');
        await expect(customCardSeparateExpiryDate.expiryYearInput).toHaveAttribute('aria-required', 'true');
        await expect(customCardSeparateExpiryDate.cvcInput).toHaveAttribute('aria-required', 'true');
    });
});
