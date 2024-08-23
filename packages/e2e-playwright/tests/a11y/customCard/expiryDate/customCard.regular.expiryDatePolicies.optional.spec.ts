import { test, expect } from '../../../../pages/customCard/customCard.fixture';
import { REGULAR_TEST_CARD } from '../../../utils/constants';
import { binLookupMock } from '../../../../mocks/binLookup/binLookup.mock';
import { optionalDateAndCvcMock } from '../../../../mocks/binLookup/binLookup.data';

test.describe('Test how Custom Card Component with regular date field handles hidden expiryDate policy', () => {
    test('#2 how securedField responds', async ({ customCardPage }) => {
        const { card, page } = customCardPage;

        await binLookupMock(page, optionalDateAndCvcMock);

        await card.isComponentVisible();

        // Expect iframe's expiryDate (& cvc) input fields to have an aria-required attr set to true
        let dateAriaRequired = await card.expiryDateInput.getAttribute('aria-required');
        await expect(dateAriaRequired).toEqual('true');

        let cvcAriaRequired = await card.cvcInput.getAttribute('aria-required');
        await expect(cvcAriaRequired).toEqual('true');

        // Fill number to provoke (mock) binLookup response
        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect iframe's expiryDate (& cvc) input fields to have an aria-required attr set to false
        dateAriaRequired = await card.expiryDateInput.getAttribute('aria-required');
        await expect(dateAriaRequired).toEqual('false');

        cvcAriaRequired = await card.cvcInput.getAttribute('aria-required');
        await expect(cvcAriaRequired).toEqual('false');

        // Clear number and see SF's aria-required reset
        await card.deleteCardNumber();

        dateAriaRequired = await card.expiryDateInput.getAttribute('aria-required');
        await expect(dateAriaRequired).toEqual('true');

        cvcAriaRequired = await card.cvcInput.getAttribute('aria-required');
        await expect(cvcAriaRequired).toEqual('true');
    });
});
