import { test, expect } from '../../../../../fixtures/customCard.fixture';
import { BCMC_CARD, BCMC_DUAL_BRANDED_VISA, UNKNOWN_BIN_CARD_REGEX_VISA, VISA_CARD } from '../../../../utils/constants';

/**
 * NOTE: Test #1 in customCard.dualBranding.spec has established that entering a dual branded number will set the UI to the expected visual state
 * - here we test what happens, in both the UI & state, when we move back from a binLookup result
 */

test.describe('Custom Card - Dual branding reset', () => {
    test('#1 Entering a dual branded number, then deleting it should see the UI reset', async ({
        customCardSeparateExpiryDate: customCard,
        page
    }) => {
        await customCard.typeCardNumber(BCMC_CARD);

        // Delete number
        await customCard.deleteCardNumber();

        // Dual brand holder hidden
        await expect(customCard.dualBrandsHolder).not.toBeVisible();

        // Single band holder visible
        await expect(customCard.singleBrandHolder).toBeVisible();

        const brand = customCard.singleBrand;

        const brandingIconSrc = await brand.getAttribute('src');
        expect(brandingIconSrc).toContain('nocard.svg');
    });

    test(
        '#2 Entering a dual branded (bcmc) number (and selecting bcmc), should see UI & state in expected state, ' +
            'then deleting the number should reset state and UI',
        async ({ customCardSeparateExpiryDate: customCard, page }) => {
            await customCard.typeCardNumber(BCMC_CARD);

            // Because it's a bcmc/maestro card expect cvc to be hidden
            await expect(customCard.cvcField).not.toBeVisible();

            await customCard.waitForVisibleBrands();

            // Select brand
            await customCard.selectBrand('bcmc');

            // For some reason: await page.evaluate('window.customCardSeparate.data'); is really flaky in this test...
            // ...so we're doing it this way instead. The test will timeout if brand *not* set to expected value
            await page.waitForFunction(() => window['customCardSeparate'].data.paymentMethod.brand === 'bcmc');

            // Delete number
            await customCard.deleteCardNumber();

            // UI & state reset
            await expect(customCard.cvcField).toBeVisible();

            await page.waitForFunction(() => window['customCardSeparate'].data.paymentMethod.brand === undefined);
        }
    );

    test(
        '#3 Entering a dual branded number, then pasting in an unrecognised one, should see our regEx detects the brand, ' +
            'so the state & UI are set as expected',
        async ({ customCardSeparateExpiryDate: customCard, page }) => {
            await customCard.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

            // Paste in card unrecognised by /binLookuo but which our regEx recognises as Visa
            await customCard.fillCardNumber(UNKNOWN_BIN_CARD_REGEX_VISA);

            // Dual brand holder hidden
            await expect(customCard.dualBrandsHolder).not.toBeVisible();

            await page.waitForFunction(() => window['customCardSeparate'].data.paymentMethod.brand === undefined);

            // Check regEx recognises brand and sets it in the UI
            const brand = customCard.singleBrand;
            const brandingIconSrc = await brand.getAttribute('src');
            expect(brandingIconSrc).toContain('visa.svg');
        }
    );

    test('#4 Entering a dual branded number, then pasting in a recognised, single branded one, should see the state & UI are set as expected, ', async ({
        customCardSeparateExpiryDate: customCard,
        page
    }) => {
        await customCard.typeCardNumber(BCMC_CARD);

        // Paste in recognised visa number
        await customCard.fillCardNumber(VISA_CARD);

        // Dual brand holder hidden
        await expect(customCard.dualBrandsHolder).not.toBeVisible();

        // See state is set
        await page.waitForFunction(() => window['customCardSeparate'].data.paymentMethod.brand === 'visa');

        // Check brand is set in the UI
        const brand = customCard.singleBrand;
        const brandingIconSrc = await brand.getAttribute('src');
        expect(brandingIconSrc).toContain('visa.svg');
    });
});
