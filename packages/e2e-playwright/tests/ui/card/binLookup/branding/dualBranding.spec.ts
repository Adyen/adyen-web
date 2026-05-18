import { expect, test } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import { BCMC_DUAL_BRANDED_MC, BCMC_DUAL_BRANDED_VISA, DUAL_BRANDED_CARD_EXCLUDED, DUAL_BRANDED_EFTPOS, TAGS } from '../../../../utils/constants';
import { toHaveScreenshot } from '../../../../utils/assertions';

import LANG from '../../../../../../server/translations/en-US.json';
import { binLookupMock } from '../../../../../mocks/binLookup/binLookup.mock';
import { dualBrandedBcmcAndMc, dualBrandedBcmcAndVisa } from '../../../../../mocks/binLookup/binLookup.data';

const PAN_ERROR_NOT_COMPLETE = LANG['cc.num.901'];

const componentConfig = {
    brands: ['mc', 'visa', 'amex', 'maestro', 'bcmc', 'star']
};

test.describe('Card - Dual branding UI after binLookup gives a dual brand result', () => {
    test('#1 should show brand options with first selected by default for EU dual branded card', { tag: [TAGS.SCREENSHOT] }, async ({ card, page, browserName }) => {
        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        // Get a binLookup result
        await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

        // Check brand has been set, by default, in paymentMethod data
        let cardData: any = await page.evaluate('window.component.data');
        expect(cardData.paymentMethod.brand).not.toBe(undefined);

        // Expect the brand selection UI to be visible (EU dual brand)
        await expect(card.dualBrandSelector).toBeVisible();

        // Brand selection is visible with 2 options
        await expect(card.isDualBrandSelectionVisible()).resolves.toBe(true);
        await expect(card.getBrandOptionCount()).resolves.toBe(2);

        // First brand is selected by default
        await expect(card.isBrandSelected(/visa/i)).resolves.toBe(true);

        // Contextual label visible for EU co-badged card
        await expect(card.isDualBrandContextualLabelVisible()).resolves.toBe(true);

        // Screenshot: EU dual brand selector with first brand selected
        await toHaveScreenshot(card.cardNumberField, browserName, 'dual-brand-eu-default-selection.png');
    });

    test('#2 should change CVC visibility when interacting with brand selection', { tag: [TAGS.SCREENSHOT] }, async ({ card, page, browserName }) => {
        await binLookupMock(page, dualBrandedBcmcAndVisa);

        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        // Get a binLookup result
        await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

        // Brand selection is visible
        await expect(card.isDualBrandSelectionVisible()).resolves.toBe(true);

        // Select visa
        await card.selectBrand(/visa/i);

        // Expect cvc to be visible
        await expect(card.cvcField).toBeVisible();

        // Visa is now selected
        await expect(card.isBrandSelected(/visa/i)).resolves.toBe(true);

        // Select other brand (bcmc)
        await card.selectBrand(/bancontact/i);

        // Expect cvc to be hidden
        await expect(card.cvcField).not.toBeVisible();

        // Bcmc is now selected
        await expect(card.isBrandSelected(/bancontact/i)).resolves.toBe(true);

        // Brand selection is still visible
        await expect(card.dualBrandSelector).toBeVisible();

        // Screenshot: EU dual brand after switching to Bancontact
        await toHaveScreenshot(card.cardNumberField, browserName, 'dual-brand-eu-after-brand-switch.png');
    });

    test('#3 should select brand without triggering error when PAN is incomplete', async ({
        card,
        page,
        browserName
    }) => {
        test.skip(browserName === 'webkit', 'Skipping tests for WebKit');
        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        const firstDigits = BCMC_DUAL_BRANDED_VISA.substring(0, 11);
        const lastDigits = BCMC_DUAL_BRANDED_VISA.substring(11, 16);

        // Type enough digits to get a binLookup result, but not enough for the field to be complete
        await card.typeCardNumber(firstDigits);

        // Expect brand selection to be visible
        await expect(card.dualBrandSelector).toBeVisible();

        // Clicking a brand option should only select the brand, not trigger validation
        await card.selectBrand(/visa/i);
        await expect(card.isBrandSelected(/visa/i)).resolves.toBe(true);

        // No error should be shown — validation only happens on blur
        await expect(card.cardNumberErrorElement).not.toBeVisible();

        // Contextual label must remain visible while interacting with the field
        await expect(card.isDualBrandContextualLabelVisible()).resolves.toBe(true);

        // Blur the card number field to trigger validation
        await card.expiryDateInput.focus();

        // Now the error should appear
        await expect(card.cardNumberErrorElement).toBeVisible();
        await expect(card.cardNumberErrorElement).toHaveText(PAN_ERROR_NOT_COMPLETE);

        // Segmented control and contextual label should be hidden after blur with error
        await expect(card.isDualBrandSelectionVisible()).resolves.toBe(false);
        await expect(card.isDualBrandContextualLabelVisible()).resolves.toBe(false);

        // Complete the number
        await card.cardNumberInput.focus();
        await page.keyboard.press('End');
        await card.typeCardNumber(lastDigits);

        // Expect error to have gone away
        await expect(card.cardNumberErrorElement).not.toBeVisible();
    });

    test('#4 should allow brand switching with incomplete PAN without triggering errors', async ({ card, page }) => {
        await binLookupMock(page, dualBrandedBcmcAndVisa);

        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        const firstDigits = BCMC_DUAL_BRANDED_VISA.substring(0, 11);
        const lastDigits = BCMC_DUAL_BRANDED_VISA.substring(11, 16);

        // Type enough digits to get a binLookup result, but not enough for the field to be complete
        await card.typeCardNumber(firstDigits);

        await expect(card.isDualBrandSelectionVisible()).resolves.toBe(true);

        // Select visa — no error should appear
        await card.selectBrand(/visa/i);
        await expect(card.isBrandSelected(/visa/i)).resolves.toBe(true);
        await expect(card.cardNumberErrorElement).not.toBeVisible();

        // Contextual label must remain visible after first switch
        await expect(card.isDualBrandContextualLabelVisible()).resolves.toBe(true);

        // Select bcmc — still no error
        await card.selectBrand(/bancontact/i);
        await expect(card.isBrandSelected(/bancontact/i)).resolves.toBe(true);
        await expect(card.cardNumberErrorElement).not.toBeVisible();

        // Contextual label must remain visible after second switch
        await expect(card.isDualBrandContextualLabelVisible()).resolves.toBe(true);

        // Blur to another field — now validation triggers
        await card.expiryDateInput.focus();
        await expect(card.cardNumberErrorElement).toBeVisible();
        await expect(card.cardNumberErrorElement).toHaveText(PAN_ERROR_NOT_COMPLETE);

        // Segmented control and contextual label should be hidden after blur with error
        await expect(card.isDualBrandSelectionVisible()).resolves.toBe(false);
        await expect(card.isDualBrandContextualLabelVisible()).resolves.toBe(false);

        // Complete the number
        await card.cardNumberInput.focus();
        await page.keyboard.press('End');
        await card.typeCardNumber(lastDigits);

        // Expect error to have gone away
        await expect(card.cardNumberErrorElement).not.toBeVisible();
    });

    test(
        '#5 should show no selection UI for excluded dual brand',
        async ({ card, page }) => {
            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

            await card.typeCardNumber(DUAL_BRANDED_CARD_EXCLUDED);

            // Check brand has not been set in paymentMethod data
            let cardData: any = await page.evaluate('window.component.data');
            expect(cardData.paymentMethod.brand).toBe(undefined);

            // Expect dual brand icons not to be visible
            await expect(card.dualBrandSelector).not.toBeVisible();

            // No brand selection UI
            await expect(card.isDualBrandSelectionVisible()).resolves.toBe(false);

            // No contextual label
            await expect(card.isDualBrandContextualLabelVisible()).resolves.toBe(false);
        }
    );

    test(
        '#6 should show icons but no selection mechanism for non-EU dual brand',
        { tag: [TAGS.SCREENSHOT] },
        async ({ card, page, browserName }) => {
            const componentConfig = { brands: ['mc', 'visa', 'amex', 'maestro', 'bcmc', 'eftpos_australia'] };

            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

            await card.typeCardNumber(DUAL_BRANDED_EFTPOS);

            // Check brand has not been set in paymentMethod data
            let cardData: any = await page.evaluate('window.component.data');
            expect(cardData.paymentMethod.brand).toBe(undefined);

            // Expect dual brand icons *to* be visible (display-only)
            await expect(card.brandingIcon.first()).toBeVisible();

            // No interactive selection UI
            await expect(card.isDualBrandSelectionVisible()).resolves.toBe(false);

            // No contextual label
            await expect(card.isDualBrandContextualLabelVisible()).resolves.toBe(false);

            // Screenshot: Non-EU dual brand (display-only, no selection border)
            await toHaveScreenshot(card.cardNumberField, browserName, 'dual-brand-non-eu-display-only.png');
        }
    );

    test('#7 should show regex brand "mc" while typing, then bcmc/mc dual brand from binLookup', async ({ card, page }) => {
        await binLookupMock(page, dualBrandedBcmcAndMc);

        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        // Regex best match: only the first 3 digits — binLookup not yet triggered
        await card.typeCardNumber(BCMC_DUAL_BRANDED_MC.slice(0, 3));

        // Regex best match: Mastercard, no dual-brand selector yet
        await expect(card.isDualBrandSelectionVisible()).resolves.toBe(false);
        await expect(card.brandingIcon).toHaveAttribute('alt', /mastercard/i);

        await card.typeCardNumber(BCMC_DUAL_BRANDED_MC.slice(3));

        await expect(card.dualBrandSelector).toBeVisible();
        await expect(card.getBrandOptionCount()).resolves.toBe(2);
        await expect(card.getBrandButton(/bancontact/i)).toBeVisible();
        await expect(card.getBrandButton(/mastercard/i)).toBeVisible();
    });

    test('#8 should show regex brand "visa" while typing, then bcmc/visa dual brand from binLookup', async ({ card }) => {
        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        // Regex best match: first 3 digits — binLookup not yet triggered
        await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA.slice(0, 3));

        await expect(card.isDualBrandSelectionVisible()).resolves.toBe(false);
        await expect(card.brandingIcon).toHaveAttribute('alt', /visa/i);

        // Type up to 11 digits — binLookup triggers, dual brand appears
        await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA.slice(3, 11));

        await expect(card.dualBrandSelector).toBeVisible();
        await expect(card.getBrandOptionCount()).resolves.toBe(2);
        await expect(card.getBrandButton(/bancontact/i)).toBeVisible();
        await expect(card.getBrandButton(/visa/i)).toBeVisible();

        // Remove one digit — drops below binLookup threshold, regex best match returns to visa
        await card.cardNumberInput.press('Backspace');

        await expect(card.isDualBrandSelectionVisible()).resolves.toBe(false);
        await expect(card.brandingIcon).toHaveAttribute('alt', /visa/i);

        // Fill the rest of the PAN — dual brand selector reappears
        await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA.slice(10));

        await expect(card.dualBrandSelector).toBeVisible();
        await expect(card.getBrandOptionCount()).resolves.toBe(2);
        await expect(card.getBrandButton(/bancontact/i)).toBeVisible();
        await expect(card.getBrandButton(/visa/i)).toBeVisible();
    });
});
