import { test, expect } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import { binLookupMock } from '../../../../../mocks/binLookup/binLookup.mock';
import { kcpMockOptionalDateAndCvcWithPanLengthMock } from '../../../../../mocks/binLookup/binLookup.data';
import { CARD_WITH_PAN_LENGTH, REGULAR_TEST_CARD } from '../../../../utils/constants';

const componentConfig = {
    brands: ['mc', 'visa', 'amex', 'korean_local_card'],
    configuration: { koreanAuthenticationRequired: true },
    countryCode: 'KR'
};

test.describe('Test how Card Component handles binLookup returning a panLength property for a card with a KCP fields', () => {
    test('#1 Fill out PAN (binLookup w. panLength) see that focus moves to tax number since expiryDate & cvc are optional', async ({
        cardWithKCP,
        page
    }) => {
        await binLookupMock(page, kcpMockOptionalDateAndCvcWithPanLengthMock);

        await cardWithKCP.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        await cardWithKCP.isComponentVisible();

        await cardWithKCP.typeCardNumber(REGULAR_TEST_CARD);

        // Expect UI change - tax number field has focus
        await expect(cardWithKCP.cardNumberInput).not.toBeFocused();
        await expect(cardWithKCP.taxNumberInput).toBeFocused();
    });

    test('#2 Paste non KCP PAN and see focus move to date field', async ({ cardWithKCP, page, browserName }) => {
        // test.skip(browserName === 'webkit', 'This test is not run for Safari because it always fails on the CI due to the "pasting"');

        await cardWithKCP.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        await cardWithKCP.isComponentVisible();

        // "Paste" number
        await cardWithKCP.fillCardNumber(CARD_WITH_PAN_LENGTH);
        await page.waitForTimeout(100);

        // Expect UI change - expiryDate field has focus
        await expect(cardWithKCP.cardNumberInput).not.toBeFocused();
        await expect(cardWithKCP.expiryDateInput).toBeFocused();
    });
});
