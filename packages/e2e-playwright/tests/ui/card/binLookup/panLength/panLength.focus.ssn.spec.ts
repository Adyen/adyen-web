import { test, expect } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import { binLookupMock } from '../../../../../mocks/binLookup/binLookup.mock';
import { optionalDateAndCvcWithPanLengthMock } from '../../../../../mocks/binLookup/binLookup.data';
import { REGULAR_TEST_CARD } from '../../../../utils/constants';

test.describe('Test Card, binLookup w. panLength property & social security number', () => {
    test('#1 Fill out PAN see that focus moves to social security number since expiryDate & cvc are optional', async ({ cardWithSSN, page }) => {
        await binLookupMock(page, optionalDateAndCvcWithPanLengthMock);

        const componentConfig = { configuration: { socialSecurityNumberMode: 'show' } };

        await cardWithSSN.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        await cardWithSSN.isComponentVisible();

        await cardWithSSN.typeCardNumber(REGULAR_TEST_CARD);

        // Expect UI change - ssn field has focus
        await expect(cardWithSSN.cardNumberInput).not.toBeFocused();
        await expect(cardWithSSN.ssnInput).toBeFocused();
    });
});
