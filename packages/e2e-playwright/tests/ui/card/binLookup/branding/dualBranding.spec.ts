import { expect, test } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import { BCMC_DUAL_BRANDED_VISA, DUAL_BRANDED_CARD_EXCLUDED, DUAL_BRANDED_EFTPOS } from '../../../../utils/constants';

import LANG from '../../../../../../server/translations/en-US.json';

const PAN_ERROR_NOT_COMPLETE = LANG['cc.num.901'];

const componentConfig = {
    brands: ['mc', 'visa', 'amex', 'maestro', 'bcmc', 'star']
};

test.describe('Card - Testing full UI (PAN icons & dual branding buttons) after binLookup has given a dual brand result', () => {
    test(
        '#1 Fill in dual branded card, then ' +
            ' see dual brand icons and dual brand buttons appear as expected, with first element selected by default',
        async ({ card, page }) => {
            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

            // Get a binLookup result
            await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

            // Check brand has been set, by default, in paymentMethod data
            let cardData: any = await page.evaluate('window.component.data');
            expect(cardData.paymentMethod.brand).not.toBe(undefined);

            /**
             * Dual brand icons
             */
            // Expect inline dual brand icons to be visible
            await expect(card.dualBrandingIconsHolder).toBeVisible();

            const [firstIcon, secondIcon] = await card.dualBrandIcons;

            // 2 brand icons
            expect(firstIcon).toBeDefined();
            expect(secondIcon).toBeDefined();

            /**
             * Dual brand buttons
             */
            // Expect dual brand buttons to be visible...
            await expect(card.dualBrandingButtonsHolder).toBeVisible();

            // ...with 2 buttons...
            const [firstButton, secondButton] = await card.dualBrandingButtonElements;
            await expect(firstButton).toBeVisible();
            await expect(secondButton).toBeVisible();

            // First element selected by default
            await expect(card.getDualBrandButtonCheckmark(firstButton)).toBeVisible();
            await expect(card.getDualBrandButtonCheckmark(secondButton)).not.toBeVisible();
        }
    );

    test('#2 Fill in dual branded card, see dual brand UI has expected effects when interacted with', async ({ card, page }) => {
        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        // Get a binLookup result
        await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

        /**
         * Dual brand buttons
         */
        // Expect dual brand buttons to be visible...
        await expect(card.dualBrandingButtonsHolder).toBeVisible();

        // Move focus to date
        await card.selectDateIcon();
        await expect(card.expiryDateInput).toBeFocused();

        // Select visa
        const visaBtn = card.selectDualBrandUIItem(/visa/i);
        await visaBtn.click();

        // Expect cvc to be visible
        await expect(card.cvcField).toBeVisible();

        // Find the button's parent, so we can see if that parent also contains a checkmark
        let btnParent = visaBtn.locator('xpath=..');

        // Button in selected state (showing a checkmark)
        await expect(card.getDualBrandButtonCheckmark(btnParent)).toBeVisible();

        // Clicking buttons should not have seen focus move to the PAN or the date fields
        await expect(card.cardNumberInput).not.toBeFocused();
        await expect(card.expiryDateInput).not.toBeFocused();

        // Select other brand
        const bcmcBtn = card.selectDualBrandUIItem(/bancontact/i, false);
        await bcmcBtn.click();

        // Expect cvc to be hidden
        await expect(card.cvcField).not.toBeVisible();

        // Find the button's parent, so we can see if that parent also contains a checkmark
        btnParent = bcmcBtn.locator('xpath=..');

        // Button in selected state (showing a checkmark)
        await expect(card.getDualBrandButtonCheckmark(btnParent)).toBeVisible();

        // Clicking buttons should not have seen focus move to the PAN or the date fields
        await expect(card.cardNumberInput).not.toBeFocused();
        await expect(card.expiryDateInput).not.toBeFocused();

        /**
         * Dual brand icons
         *
         */
        // Expect inline dual brand icons to be visible
        await expect(card.dualBrandingIconsHolder).toBeVisible();

        // Click a brand icon and see focus move to the PAN
        await card.selectBrandIcon(/visa/i, null, true);
        await expect(card.cardNumberInput).toBeFocused();

        // Move focus to date
        await card.selectDateIcon();
        await expect(card.expiryDateInput).toBeFocused();

        // Click the other brand icon and see focus move to the PAN
        await card.selectBrandIcon(/bancontact/i);
        await expect(card.cardNumberInput).toBeFocused();
    });

    test('#3 Fill in dual branded card, but do not complete the number, see dual brand icons have expected effects when interacted with', async ({
        card,
        page
    }) => {
        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        const firstDigits = BCMC_DUAL_BRANDED_VISA.substring(0, 11);
        const lastDigits = BCMC_DUAL_BRANDED_VISA.substring(11, 16);

        // Type enough digits to get a binLookup result, but not enough for the field to be complete
        await card.typeCardNumber(firstDigits);

        // Expect inline dual brand icons to be visible
        await expect(card.dualBrandingIconsHolder).toBeVisible();

        // Trying to click one should force an error in the UI
        await card.selectBrandIcon(/visa/i, null, true);

        // We should get a error on the number field
        await expect(card.cardNumberErrorElement).toBeVisible();
        await expect(card.cardNumberErrorElement).toHaveText(PAN_ERROR_NOT_COMPLETE);

        // Complete the number
        await card.cardNumberInput.focus(); // Focus the input field
        await page.keyboard.press('End');
        await card.typeCardNumber(lastDigits);

        // Expect error to have gone away
        await expect(card.cardNumberErrorElement).not.toBeVisible();

        // Move focus to date
        await card.selectDateIcon();
        await expect(card.expiryDateInput).toBeFocused();

        // Click a brand icon and see focus move to the PAN
        await card.selectBrandIcon(/bancontact/i);
        await expect(card.cardNumberInput).toBeFocused();
    });

    test('#4 Fill in dual branded card, but do not complete the number, see dual brand buttons have expected effects when interacted with', async ({
        card,
        page
    }) => {
        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        const firstDigits = BCMC_DUAL_BRANDED_VISA.substring(0, 11);
        const lastDigits = BCMC_DUAL_BRANDED_VISA.substring(11, 16);

        // Type enough digits to get a binLookup result, but not enough for the field to be complete
        await card.typeCardNumber(firstDigits);

        await expect(card.dualBrandingButtonsHolder).toBeVisible();

        // Detect buttons
        const visaBtn = card.selectDualBrandUIItem(/visa/i);
        const bcmcBtn = card.selectDualBrandUIItem(/bancontact/i, false);

        // Find the buttons' parent, so we can see if that parent also contains a checkmark
        const visaBtnParent = visaBtn.locator('xpath=..');
        const bcmcBtnParent = bcmcBtn.locator('xpath=..');

        // Select visa
        await visaBtn.click();

        // Visa button in selected state (showing a checkmark)
        await expect(card.getDualBrandButtonCheckmark(visaBtnParent)).toBeVisible();
        // Bcmc not
        await expect(card.getDualBrandButtonCheckmark(bcmcBtnParent)).not.toBeVisible();

        // Having clicked a button We should get a error on the number field
        await expect(card.cardNumberErrorElement).toBeVisible();
        await expect(card.cardNumberErrorElement).toHaveText(PAN_ERROR_NOT_COMPLETE);

        /** ----- */

        // Select bcmc
        await bcmcBtn.click();

        // Now bcmc button should be in a selected state
        await expect(card.getDualBrandButtonCheckmark(bcmcBtnParent)).toBeVisible();
        // Visa not
        await expect(card.getDualBrandButtonCheckmark(visaBtnParent)).not.toBeVisible();

        // Complete the number
        await card.cardNumberInput.focus(); // Focus the input field
        await page.keyboard.press('End');
        await card.typeCardNumber(lastDigits);

        // Expect error to have gone away
        await expect(card.cardNumberErrorElement).not.toBeVisible();

        // Move focus to date
        await card.selectDateIcon();
        await expect(card.expiryDateInput).toBeFocused();

        // Clicking an element should not see focus move to the PAN or the date fields
        await visaBtn.click();

        await expect(card.cardNumberInput).not.toBeFocused();
        await expect(card.expiryDateInput).not.toBeFocused();
    });

    test(
        '#5 Fill in dual branded card, with a brand that should be excluded from the UI, ' +
            '(meaning there should be no dual branding UI & that no brand should be set in the PM data), ' +
            'then check PM data does not have a brand property,' +
            'and check there are no dual branding icons/buttons',
        async ({ card, page }) => {
            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

            await card.typeCardNumber(DUAL_BRANDED_CARD_EXCLUDED);

            // Check brand has not been set in paymentMethod data
            let cardData: any = await page.evaluate('window.component.data');
            expect(cardData.paymentMethod.brand).toBe(undefined);

            // Expect dual brand icons not to be visible
            await expect(card.dualBrandingIconsHolder).not.toBeVisible();

            // Expect dual brand UI not to be visible
            await expect(card.dualBrandingButtonsHolder).not.toBeVisible();
        }
    );

    test(
        '#6 Fill in dual branded card, with PAN that falls outside of EU regulations, ' +
            '(meaning that the button part of the dual branding UI should not show & the brand should not be set in the PM data), ' +
            'then check PM data does not have a brand property,' +
            'and check there are no dual branding buttons',
        async ({ card, page }) => {
            const componentConfig = { brands: ['mc', 'visa', 'amex', 'maestro', 'bcmc', 'eftpos_australia'] };

            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

            await card.typeCardNumber(DUAL_BRANDED_EFTPOS);

            // Check brand has not been set in paymentMethod data
            let cardData: any = await page.evaluate('window.component.data');
            expect(cardData.paymentMethod.brand).toBe(undefined);

            // Expect dual brand icons *to* be visible
            await expect(card.dualBrandingIconsHolder).toBeVisible();

            // Expect dual brand UI *not* to be visible
            await expect(card.dualBrandingButtonsHolder).not.toBeVisible();
        }
    );
});
