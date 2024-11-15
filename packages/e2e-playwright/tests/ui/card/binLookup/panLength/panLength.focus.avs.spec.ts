import { test, expect } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import { binLookupMock } from '../../../../../mocks/binLookup/binLookup.mock';
import { optionalDateAndCvcWithPanLengthMock } from '../../../../../mocks/binLookup/binLookup.data';
import { REGULAR_TEST_CARD } from '../../../../utils/constants';

test.describe('Test Card, binLookup w. panLength property & address fields', () => {
    test('#1 Fill out PAN & see that focus moves to an address field since expiryDate & cvc are optional', async ({ card, page }) => {
        await binLookupMock(page, optionalDateAndCvcWithPanLengthMock);

        const componentConfig = { billingAddressRequired: true, billingAddressRequiredFields: ['street', 'houseNumberOrName', 'postalCode', 'city'] };

        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        await card.isComponentVisible();

        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect focus to be place on address (street) field
        await expect(card.cardNumberLabelWithFocus).not.toBeVisible();
        await expect(card.addressLabelWithFocus).toBeVisible();
    });
});
