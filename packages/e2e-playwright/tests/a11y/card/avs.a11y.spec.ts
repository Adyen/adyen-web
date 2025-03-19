import { test as base, expect } from '../../../fixtures/base-fixture';
import { binLookupMock } from '../../../mocks/binLookup/binLookup.mock';
import { optionalDateAndCvcWithPanLengthMock } from '../../../mocks/binLookup/binLookup.data';
import { REGULAR_TEST_CARD } from '../../utils/constants';
import { CardWithAvs } from '../../../models/card-avs';
import { getStoryUrl } from '../../utils/getStoryUrl';
import { URL_MAP } from '../../../fixtures/URL_MAP';

type Fixture = {
    cardAvsPage: CardWithAvs;
};

const test = base.extend<Fixture>({
    cardAvsPage: async ({ page }, use) => {
        const cardPage = new CardWithAvs(page);
        const componentConfig = { billingAddressRequired: true, billingAddressRequiredFields: ['street', 'houseNumberOrName', 'postalCode', 'city'] };
        await cardPage.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));
        await binLookupMock(page, optionalDateAndCvcWithPanLengthMock);
        await use(cardPage);
    }
});

test.describe('Card - AVS', () => {
    test('should move the focus to the address field since expiryDate & cvc are optional', async ({ page, cardAvsPage }) => {
        const firstDigits = REGULAR_TEST_CARD.substring(0, 15);
        const lastDigits = REGULAR_TEST_CARD.substring(15, 16);
        await cardAvsPage.typeCardNumber(firstDigits);
        await cardAvsPage.typeCardNumber(lastDigits);

        await expect(cardAvsPage.billingAddress.streetInput).toBeFocused();
    });
});
