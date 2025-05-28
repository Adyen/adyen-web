import { expect, test } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import { BCMC_DUAL_BRANDED_VISA, DUAL_BRANDED_CARD_EXCLUDED } from '../../../../utils/constants';

import LANG from '../../../../../../server/translations/en-US.json';

const PAN_ERROR_NOT_COMPLETE = LANG['cc.num.901'];

const componentConfig = {
    brands: ['mc', 'visa', 'amex', 'maestro', 'bcmc', 'star']
};

test.describe('Card - Testing full UI (PAN icons & dual branding UI) after binLookup has given a dual brand result', () => {
    test('#1 Fill in dual branded card, but do not complete the number, see inline dual brand icons are visible but only serve to focus the PAN, even after PAN completed', async ({
        card,
        page
    }) => {
        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        const firstDigits = BCMC_DUAL_BRANDED_VISA.substring(0, 11);
        const lastDigits = BCMC_DUAL_BRANDED_VISA.substring(11, 16);

        // Type enough digits to get a binLookup result, but not enough for the field to be complete
        await card.typeCardNumber(firstDigits);

        // Since the dominant brand is bcmc - expect the cvc field to be hidden
        await expect(card.cvcField).not.toBeVisible();

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

        // Now we have selected visa - expect cvc to be visible... OLD
        // await expect(card.cvcField).toBeVisible();

        // Click a brand icon and see focus move to the PAN
        await card.selectBrand(/visa/i);
        await expect(card.cardNumberInput).toBeFocused();
    });

    test('#2 Fill in dual branded card, see dual brand UI is visible, with first element selected by default', async ({ card, page }) => {
        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        // Get a binLookup result
        await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

        // Since the dominant brand is bcmc - expect the cvc field to be hidden
        await expect(card.cvcField).not.toBeVisible();

        // Expect dual brand UI to be visible...
        await expect(card.dualBrandingUIHolder).toBeVisible();

        // ...with 2 buttons...
        const [firstBrand, secondBrand] = await card.uiBrandElements;
        await expect(firstBrand).toBeVisible();
        await expect(secondBrand).toBeVisible();

        // ...each with expected image and text
        await expect(card.getUIBrandElementImage(firstBrand)).toHaveAttribute('alt', /bancontact/i);
        await expect(card.getUIBrandElementLabel(firstBrand)).toHaveText(/bancontact/i);

        await expect(card.getUIBrandElementImage(secondBrand)).toHaveAttribute('alt', /visa/i);
        await expect(card.getUIBrandElementLabel(secondBrand)).toHaveText(/visa/i);

        // First element selected by default
        await expect(card.getUIBrandElementCheckmark(firstBrand)).toBeVisible();
        await expect(card.getUIBrandElementCheckmark(secondBrand)).not.toBeVisible();
    });

    test('#3 Fill in dual branded card, see dual brand UI has expected effects when interacted with', async ({ card, page }) => {
        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        // Get a binLookup result
        await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

        // Since the dominant brand is bcmc - expect the cvc field to be hidden
        await expect(card.cvcField).not.toBeVisible();

        // Expect dual brand UI to be visible...
        await expect(card.dualBrandingUIHolder).toBeVisible();

        const [firstBrand, secondBrand] = await card.uiBrandElements;

        // Move focus to date
        await card.selectDateIcon();
        await expect(card.expiryDateInput).toBeFocused();

        // Select visa
        await card.getUIBrandElementLabel(secondBrand).click();

        // Expect cvc to be visible
        await expect(card.cvcField).toBeVisible();

        // Second element in selected state
        await expect(card.getUIBrandElementCheckmark(firstBrand)).not.toBeVisible();
        await expect(card.getUIBrandElementCheckmark(secondBrand)).toBeVisible();

        // Clicking buttons should not see focus move to the PAN or the date fields
        await expect(card.cardNumberInput).not.toBeFocused();
        await expect(card.expiryDateInput).not.toBeFocused();

        // Reselect first brand
        await card.getUIBrandElementLabel(firstBrand).click();

        // Expect cvc to be hidden again
        await expect(card.cvcField).not.toBeVisible();

        // First element in selected state
        await expect(card.getUIBrandElementCheckmark(firstBrand)).toBeVisible();
        await expect(card.getUIBrandElementCheckmark(secondBrand)).not.toBeVisible();

        // Clicking buttons should not see focus move to the PAN or the date fields
        await expect(card.cardNumberInput).not.toBeFocused();
        await expect(card.expiryDateInput).not.toBeFocused();
    });

    test(
        '#4 Fill in dual branded card, ' +
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
            await expect(card.dualBrandingUIHolder).not.toBeVisible();
        }
    );
});
