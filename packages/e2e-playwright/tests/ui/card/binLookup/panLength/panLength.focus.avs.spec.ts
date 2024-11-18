import { mergeTests, expect } from '@playwright/test';
import { test as cardWithAvs } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import { binLookupMock } from '../../../../../mocks/binLookup/binLookup.mock';
import { optionalDateAndCvcWithPanLengthMock } from '../../../../../mocks/binLookup/binLookup.data';
import { REGULAR_TEST_CARD } from '../../../../utils/constants';

const test = mergeTests(cardWithAvs);

test.describe('Test Card, binLookup w. panLength property & address fields', () => {
    test('#1 Fill out PAN & see that focus moves to an address field since expiryDate & cvc are optional', async ({ cardWithAvs, page }) => {
        await binLookupMock(page, optionalDateAndCvcWithPanLengthMock);

        const componentConfig = { billingAddressRequired: true, billingAddressRequiredFields: ['street', 'houseNumberOrName', 'postalCode', 'city'] };

        await cardWithAvs.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        await cardWithAvs.isComponentVisible();

        await cardWithAvs.typeCardNumber(REGULAR_TEST_CARD);

        // Expect focus to be place on address (street) field
        await expect(cardWithAvs.cardNumberInput).not.toBeFocused();
        await expect(cardWithAvs.billingAddress.streetInput).toBeFocused();
    });
});
