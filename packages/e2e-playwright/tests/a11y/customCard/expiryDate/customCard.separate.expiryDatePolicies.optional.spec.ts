import { test, expect } from '../../../../pages/customCard/customCard.fixture';
import { REGULAR_TEST_CARD } from '../../../utils/constants';
import { binLookupMock } from '../../../../mocks/binLookup/binLookup.mock';
import { optionalDateAndCvcMock } from '../../../../mocks/binLookup/binLookup.data';

test.describe('Test how Custom Card Component with separate date fields handles hidden expiryDate policy', () => {
    test('#2 how securedField responds', async ({ customCardPageSeparate }) => {
        const { card, page } = customCardPageSeparate;

        await binLookupMock(page, optionalDateAndCvcMock);

        await card.isSeparateComponentVisible();

        // Expect iframe's date (& cvc) input fields to have an aria-required attr set to true
        let monthAriaRequired = await card.expiryMonthInput.getAttribute('aria-required');
        await expect(monthAriaRequired).toEqual('true');

        let yearAriaRequired = await card.expiryYearInput.getAttribute('aria-required');
        await expect(yearAriaRequired).toEqual('true');

        let cvcAriaRequired = await card.cvcInput.getAttribute('aria-required');
        await expect(cvcAriaRequired).toEqual('true');

        // Fill number to provoke (mock) binLookup response
        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect iframe's date (& cvc) input fields to have an aria-required attr set to false
        monthAriaRequired = await card.expiryMonthInput.getAttribute('aria-required');
        await expect(monthAriaRequired).toEqual('false');

        yearAriaRequired = await card.expiryYearInput.getAttribute('aria-required');
        await expect(yearAriaRequired).toEqual('false');

        cvcAriaRequired = await card.cvcInput.getAttribute('aria-required');
        await expect(cvcAriaRequired).toEqual('false');

        // Clear number and see SF's aria-required reset
        await card.deleteCardNumber();

        monthAriaRequired = await card.expiryMonthInput.getAttribute('aria-required');
        await expect(monthAriaRequired).toEqual('true');

        yearAriaRequired = await card.expiryYearInput.getAttribute('aria-required');
        await expect(yearAriaRequired).toEqual('true');

        cvcAriaRequired = await card.cvcInput.getAttribute('aria-required');
        await expect(cvcAriaRequired).toEqual('true');
    });
});
