import { test, expect } from '../../../../fixtures/customCard/customCard.fixture';
import { REGULAR_TEST_CARD } from '../../../utils/constants';
import { binLookupMock } from '../../../../mocks/binLookup/binLookup.mock';
import { optionalDateAndCvcMock } from '../../../../mocks/binLookup/binLookup.data';

test.describe('Test how Custom Card Component with separate date fields handles hidden expiryDate policy', () => {
    test('#2 how securedField responds', async ({ page, customCardPageSeparate }) => {
        await binLookupMock(page, optionalDateAndCvcMock);

        // Expect iframe's date (& cvc) input fields to have an aria-required attr set to true
        let monthAriaRequired = await customCardPageSeparate.expiryMonthInput.getAttribute('aria-required');
        await expect(monthAriaRequired).toEqual('true');

        let yearAriaRequired = await customCardPageSeparate.expiryYearInput.getAttribute('aria-required');
        await expect(yearAriaRequired).toEqual('true');

        let cvcAriaRequired = await customCardPageSeparate.cvcInput.getAttribute('aria-required');
        await expect(cvcAriaRequired).toEqual('true');

        // Fill number to provoke (mock) binLookup response
        await customCardPageSeparate.typeCardNumber(REGULAR_TEST_CARD);

        // Expect iframe's date (& cvc) input fields to have an aria-required attr set to false
        monthAriaRequired = await customCardPageSeparate.expiryMonthInput.getAttribute('aria-required');
        await expect(monthAriaRequired).toEqual('false');

        yearAriaRequired = await customCardPageSeparate.expiryYearInput.getAttribute('aria-required');
        await expect(yearAriaRequired).toEqual('false');

        cvcAriaRequired = await customCardPageSeparate.cvcInput.getAttribute('aria-required');
        await expect(cvcAriaRequired).toEqual('false');

        // Clear number and see SF's aria-required reset
        await customCardPageSeparate.deleteCardNumber();

        monthAriaRequired = await customCardPageSeparate.expiryMonthInput.getAttribute('aria-required');
        await expect(monthAriaRequired).toEqual('true');

        yearAriaRequired = await customCardPageSeparate.expiryYearInput.getAttribute('aria-required');
        await expect(yearAriaRequired).toEqual('true');

        cvcAriaRequired = await customCardPageSeparate.cvcInput.getAttribute('aria-required');
        await expect(cvcAriaRequired).toEqual('true');
    });
});
