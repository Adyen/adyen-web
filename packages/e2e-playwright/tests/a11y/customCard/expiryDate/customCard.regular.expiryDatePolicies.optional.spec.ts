import { test, expect } from '../../../../fixtures/customCard.fixture';
import { REGULAR_TEST_CARD } from '../../../utils/constants';
import { binLookupMock } from '../../../../mocks/binLookup/binLookup.mock';
import { optionalDateAndCvcMock } from '../../../../mocks/binLookup/binLookup.data';

test.describe('Test how Custom Card Component with regular date field handles hidden expiryDate policy', () => {
    test('#2 how securedField responds', async ({ page, customCard }) => {
        await binLookupMock(page, optionalDateAndCvcMock);

        // Expect iframe's expiryDate (& cvc) input fields to have an aria-required attr set to true
        let dateAriaRequired = await customCard.expiryDateInput.getAttribute('aria-required');
        await expect(dateAriaRequired).toEqual('true');

        let cvcAriaRequired = await customCard.cvcInput.getAttribute('aria-required');
        await expect(cvcAriaRequired).toEqual('true');

        // Fill number to provoke (mock) binLookup response
        await customCard.typeCardNumber(REGULAR_TEST_CARD);

        // Expect iframe's expiryDate (& cvc) input fields to have an aria-required attr set to false
        dateAriaRequired = await customCard.expiryDateInput.getAttribute('aria-required');
        await expect(dateAriaRequired).toEqual('false');

        cvcAriaRequired = await customCard.cvcInput.getAttribute('aria-required');
        await expect(cvcAriaRequired).toEqual('false');

        // Clear number and see SF's aria-required reset
        await customCard.deleteCardNumber();

        dateAriaRequired = await customCard.expiryDateInput.getAttribute('aria-required');
        await expect(dateAriaRequired).toEqual('true');

        cvcAriaRequired = await customCard.cvcInput.getAttribute('aria-required');
        await expect(cvcAriaRequired).toEqual('true');
    });
});
