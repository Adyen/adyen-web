import { test, expect } from '../../../../../fixtures/customCard.fixture';
import { REGULAR_TEST_CARD, UNKNOWN_BIN_CARD_REGEX_VISA } from '../../../../utils/constants';

test.describe('Custom Card - Single branding reset', () => {
    test('#1 Entering a single branded number, should see the state & UI set as expected, ', async ({
        customCardSeparateExpiryDate: customCard,
        page
    }) => {
        await customCard.typeCardNumber(REGULAR_TEST_CARD);

        // Single band holder visible
        await expect(customCard.singleBrandHolder).toBeVisible();

        // Dual brand holder hidden
        await expect(customCard.dualBrandsHolder).not.toBeVisible();

        // mc brand
        const brand = customCard.singleBrand;

        const brandingIconSrc = await brand.getAttribute('src');
        expect(brandingIconSrc).toContain('mc.svg');

        // Check brand has been set in paymentMethod data
        await page.waitForFunction(() => window['customCardSeparate'].data.paymentMethod.brand === 'mc');
    });

    test(
        '#2 Entering a single branded number, then pasting in an unrecognised one, should see our regEx detects the brand, ' +
            'so the state & UI are (re)set as expected',
        async ({ customCardSeparateExpiryDate: customCard, page }) => {
            await customCard.typeCardNumber(REGULAR_TEST_CARD);

            // Paste in card unrecognised by /binLookuo but which our regEx recognises as Visa
            await customCard.fillCardNumber(UNKNOWN_BIN_CARD_REGEX_VISA);

            await page.waitForFunction(() => window['customCardSeparate'].data.paymentMethod.brand === undefined);

            // Check regEx recognises brand and sets it in the UI
            const brand = customCard.singleBrand;
            const brandingIconSrc = await brand.getAttribute('src');
            expect(brandingIconSrc).toContain('visa.svg');
        }
    );

    test('#3 Entering a single branded number, then deleting it should see the state & UI are (re)set as expected', async ({
        customCardSeparateExpiryDate: customCard,
        page
    }) => {
        await customCard.typeCardNumber(REGULAR_TEST_CARD);

        await customCard.deleteCardNumber();

        await page.waitForFunction(() => window['customCardSeparate'].data.paymentMethod.brand === undefined);

        // Check regEx recognises brand and sets it in the UI
        const brand = customCard.singleBrand;
        const brandingIconSrc = await brand.getAttribute('src');
        expect(brandingIconSrc).toContain('nocard.svg');
    });
});
