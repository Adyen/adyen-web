import { expect, test } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import { BCMC_DUAL_BRANDED_VISA, DUAL_BRANDED_CARD_EXCLUDED } from '../../../../utils/constants';

import LANG from '../../../../../../server/translations/en-US.json';

const PAN_ERROR_NOT_COMPLETE = LANG['cc.num.901'];

const componentConfig = {
    brands: ['mc', 'visa', 'amex', 'maestro', 'bcmc', 'star']
};

test.describe('Card - Testing full UI (PAN icons & dual branding buttons) after binLookup has given a dual brand result', () => {
    test('#1 Fill in dual branded card, see dual brand icons and dual brand buttons appear as expected, with first element selected by default', async ({
        card,
        page
    }) => {
        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        // Get a binLookup result
        await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

        /**
         * Dual brand icons
         */
        // Expect inline dual brand icons to be visible
        await expect(card.dualBrandingIconsHolder).toBeVisible();

        let [firstIcon, secondIcon] = await card.dualBrandIcons;

        // 2 brand icons, in correct order
        expect(firstIcon).toHaveAttribute('data-value', 'bcmc');
        expect(secondIcon).toHaveAttribute('data-value', 'visa');

        /**
         * Dual brand buttons
         */
        // Expect dual brand buttons to be visible...
        await expect(card.dualBrandingButtonsHolder).toBeVisible();

        // ...with 2 buttons...
        const [firstButton, secondButton] = await card.dualBrandingButtonElements;
        await expect(firstButton).toBeVisible();
        await expect(secondButton).toBeVisible();

        // ...each with expected image and text
        await expect(card.getDualBrandButtonImage(firstButton)).toHaveAttribute('alt', /bancontact/i);
        await expect(card.getDualBrandButtonLabel(firstButton)).toHaveText(/bancontact/i);

        await expect(card.getDualBrandButtonImage(secondButton)).toHaveAttribute('alt', /visa/i);
        await expect(card.getDualBrandButtonLabel(secondButton)).toHaveText(/visa/i);

        // First element selected by default
        await expect(card.getDualBrandButtonCheckmark(firstButton)).toBeVisible();
        await expect(card.getDualBrandButtonCheckmark(secondButton)).not.toBeVisible();
    });

    test('#2 Fill in dual branded card, see dual brand UI has expected effects when interacted with', async ({ card, page }) => {
        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        // Get a binLookup result
        await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

        // Since the dominant brand is bcmc - expect the cvc field to be hidden
        await expect(card.cvcField).not.toBeVisible();

        /**
         * Dual brand buttons
         */
        // Expect dual brand buttons to be visible...
        await expect(card.dualBrandingButtonsHolder).toBeVisible();

        const [firstButton, secondButton] = await card.dualBrandingButtonElements;

        // Move focus to date
        await card.selectDateIcon();
        await expect(card.expiryDateInput).toBeFocused();

        // Select visa
        await card.getDualBrandButtonLabel(secondButton).click();

        // Expect cvc to be visible
        await expect(card.cvcField).toBeVisible();

        // Second element in selected state
        await expect(card.getDualBrandButtonCheckmark(firstButton)).not.toBeVisible();
        await expect(card.getDualBrandButtonCheckmark(secondButton)).toBeVisible();

        // Clicking buttons should not see focus move to the PAN or the date fields
        await expect(card.cardNumberInput).not.toBeFocused();
        await expect(card.expiryDateInput).not.toBeFocused();

        // Reselect first brand
        await card.getDualBrandButtonLabel(firstButton).click();

        // Expect cvc to be hidden again
        await expect(card.cvcField).not.toBeVisible();

        // First element in selected state
        await expect(card.getDualBrandButtonCheckmark(firstButton)).toBeVisible();
        await expect(card.getDualBrandButtonCheckmark(secondButton)).not.toBeVisible();

        // Clicking buttons should not see focus move to the PAN or the date fields
        await expect(card.cardNumberInput).not.toBeFocused();
        await expect(card.expiryDateInput).not.toBeFocused();

        /**
         * Dual brand icons
         *
         */
        // Expect inline dual brand icons to be visible
        await expect(card.dualBrandingIconsHolder).toBeVisible();

        // Click a brand icon and see focus move to the PAN
        await card.selectBrand(/visa/i, null, true);
        await expect(card.cardNumberInput).toBeFocused();

        // Move focus to date
        await card.selectDateIcon();
        await expect(card.expiryDateInput).toBeFocused();

        // Click the other brand icon and see focus move to the PAN
        await card.selectBrand(/bancontact/i);
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
        await card.selectBrand(/visa/i, null, true);

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
        await card.selectBrand(/bancontact/i);
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

        const [firstButton, secondButton] = await card.dualBrandingButtonElements;

        // First element should still be in a selected state
        await expect(card.getDualBrandButtonCheckmark(firstButton)).toBeVisible();
        await expect(card.getDualBrandButtonCheckmark(secondButton)).not.toBeVisible();

        // Trying to click one (second element) should force an error in the UI
        await card.getDualBrandButtonLabel(secondButton).click();

        // We should get a error on the number field
        await expect(card.cardNumberErrorElement).toBeVisible();
        await expect(card.cardNumberErrorElement).toHaveText(PAN_ERROR_NOT_COMPLETE);

        // However second element should be in a selected state
        await expect(card.getDualBrandButtonCheckmark(firstButton)).not.toBeVisible();
        await expect(card.getDualBrandButtonCheckmark(secondButton)).toBeVisible();

        // Complete the number
        await card.cardNumberInput.focus(); // Focus the input field
        await page.keyboard.press('End');
        await card.typeCardNumber(lastDigits);

        // Expect error to have gone away
        await expect(card.cardNumberErrorElement).not.toBeVisible();

        // Move focus to date
        await card.selectDateIcon();
        await expect(card.expiryDateInput).toBeFocused();

        // Click one (first element) should not shift focus
        await card.getDualBrandButtonLabel(firstButton).click();

        // Clicking buttons should not see focus move to the PAN or the date fields
        await expect(card.cardNumberInput).not.toBeFocused();
        await expect(card.expiryDateInput).not.toBeFocused();
    });

    test(
        '#5 Fill in dual branded card, ' +
            'but one of the brands should be excluded from the UI, ' +
            '(meaning also that no brand should be set in the PM data), ' +
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
});
