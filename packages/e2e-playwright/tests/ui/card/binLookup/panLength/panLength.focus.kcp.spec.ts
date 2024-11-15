import { test, expect } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import { binLookupMock } from '../../../../../mocks/binLookup/binLookup.mock';
import { kcpMockOptionalDateAndCvcWithPanLengthMock } from '../../../../../mocks/binLookup/binLookup.data';
import { REGULAR_TEST_CARD } from '../../../../utils/constants';

const componentConfig = {
    brands: ['mc', 'visa', 'amex', 'korean_local_card'],
    configuration: { koreanAuthenticationRequired: true },
    countryCode: 'KR'
};

test.describe('Test how Card Component handles binLookup returning a panLength property for a card with a KCP fields', () => {
    test('#1 Fill out PAN (binLookup w. panLength) see that focus moves to tax number since expiryDate & cvc are optional', async ({
        card,
        page
    }) => {
        await binLookupMock(page, kcpMockOptionalDateAndCvcWithPanLengthMock);

        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        await card.isComponentVisible();

        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect UI change - tax number field has focus
        await expect(card.cardNumberLabelWithFocus).not.toBeVisible();
        await expect(card.kcpTaxNumberLabelWithFocus).toBeVisible();
    });

    test('#2 Paste non KCP PAN and see focus move to date field', async ({ card, page }) => {
        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        await card.isComponentVisible();

        // Place focus on the input
        await card.cardNumberLabelElement.click();

        // Copy text to clipboard
        await page.evaluate(() => navigator.clipboard.writeText('4000620000000007')); // Can't use the constant for some reason

        await page.waitForTimeout(1000);

        // Paste text from clipboard
        await page.keyboard.press('ControlOrMeta+V');

        await page.waitForTimeout(1000);

        // Expect UI change - expiryDate field has focus
        await expect(card.cardNumberLabelWithFocus).not.toBeVisible();
        await expect(card.expiryDateLabelWithFocus).toBeVisible();
    });
});
