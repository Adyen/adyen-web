import { test, expect } from '../../../../fixtures/customCard/customCard.fixture';
import { REGULAR_TEST_CARD } from '../../../utils/constants';
import { binLookupMock } from '../../../../mocks/binLookup/binLookup.mock';
import { optionalDateAndCvcMock } from '../../../../mocks/binLookup/binLookup.data';

test.describe('Test how Custom Card Component with regular date field handles hidden expiryDate policy', () => {
    test('#2 how securedField responds', async ({ page, customCardPage }) => {
        await binLookupMock(page, optionalDateAndCvcMock);

        // Expect iframe's expiryDate (& cvc) input fields to have an aria-required attr set to true
        let dateAriaRequired = await customCardPage.expiryDateInput.getAttribute('aria-required');
        await expect(dateAriaRequired).toEqual('true');

        let cvcAriaRequired = await customCardPage.cvcInput.getAttribute('aria-required');
        await expect(cvcAriaRequired).toEqual('true');

        // Fill number to provoke (mock) binLookup response
        await customCardPage.typeCardNumber(REGULAR_TEST_CARD);

        // Expect iframe's expiryDate (& cvc) input fields to have an aria-required attr set to false
        dateAriaRequired = await customCardPage.expiryDateInput.getAttribute('aria-required');
        await expect(dateAriaRequired).toEqual('false');

        cvcAriaRequired = await customCardPage.cvcInput.getAttribute('aria-required');
        await expect(cvcAriaRequired).toEqual('false');

        // Clear number and see SF's aria-required reset
        await customCardPage.deleteCardNumber();

        dateAriaRequired = await customCardPage.expiryDateInput.getAttribute('aria-required');
        await expect(dateAriaRequired).toEqual('true');

        cvcAriaRequired = await customCardPage.cvcInput.getAttribute('aria-required');
        await expect(cvcAriaRequired).toEqual('true');
    });
});
