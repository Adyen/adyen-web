import { expect, test } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import { BCMC_DUAL_BRANDED_VISA, DUAL_BRANDED_CARD_EXCLUDED } from '../../../../utils/constants';

import LANG from '../../../../../../server/translations/en-US.json';

const PAN_ERROR_NOT_COMPLETE = LANG['cc.num.901'];

const componentConfig = {
    brands: ['mc', 'visa', 'amex', 'maestro', 'bcmc', 'star']
};

test.describe('Card - Testing UI after binLookup has given a dual brand result', () => {
    test('#1 Fill in dual branded card, but do not complete the number, see dual brand icons are inactive until the number is completed', async ({
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

        // Expect dual brand icons to be visible
        await expect(card.dualBrandingIconsHolder).toBeVisible();

        // Since the dual brands are not yet active, trying to click one should force an error in the UI
        await card.selectBrand(/visa/i, null, true);

        // We should get a error on the number field
        await expect(card.cardNumberErrorElement).toBeVisible();
        await expect(card.cardNumberErrorElement).toHaveText(PAN_ERROR_NOT_COMPLETE);

        // Complete the number
        await card.cardNumberInput.focus(); // Focus the input field
        await page.keyboard.press('End');
        await card.typeCardNumber(lastDigits);

        // Click a brand and see that, now they are active...
        await card.selectBrand(/visa/i);

        // Expect error to go away
        await expect(card.cardNumberErrorElement).not.toBeVisible();

        // Now we have selected visa - expect cvc to be visible
        await expect(card.cvcField).toBeVisible();
    });

    test(
        '#2 Fill in dual branded card, ' +
            'then select one of the dual brands,' +
            'then check the other brand icon is at reduced alpha,' +
            'then repeat with the other icon',
        async ({ card, page }) => {
            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

            // Type dual branded card
            await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

            const [firstBrand, secondBrand] = await card.brands;

            // Check that both icons do not have the class that would cause their opacity to reduce
            await expect(firstBrand).not.toHaveClass(/adyen-checkout__card__cardNumber__brandIcon--not-selected/);
            await expect(secondBrand).not.toHaveClass(/adyen-checkout__card__cardNumber__brandIcon--not-selected/);

            // Click first brand
            await card.selectBrand('Bancontact card');

            // Check that class that adds opacity ISN'T present
            await expect(firstBrand).not.toHaveClass(/adyen-checkout__card__cardNumber__brandIcon--not-selected/);
            // Check that class that adds opacity IS present
            await expect(secondBrand).toHaveClass(/adyen-checkout__card__cardNumber__brandIcon--not-selected/);

            // Click second brand
            await card.selectBrand(/visa/i);

            // Check that opacities have switched
            await expect(firstBrand).toHaveClass(/adyen-checkout__card__cardNumber__brandIcon--not-selected/);
            await expect(secondBrand).not.toHaveClass(/adyen-checkout__card__cardNumber__brandIcon--not-selected/);
        }
    );

    test('#3 Fill in dual branded card, see dual brand icons are at reduced alpha until the number is completed', async ({ card, page }) => {
        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        const firstDigits = BCMC_DUAL_BRANDED_VISA.substring(0, 11);
        const lastDigits = BCMC_DUAL_BRANDED_VISA.substring(11, 16);

        // Type enough digits to get a binLookup result, but not enough for the field to be complete
        await card.typeCardNumber(firstDigits);

        // Expect icon holder not to have class adding full opacity
        await expect(card.dualBrandingIconsHolder).not.toHaveClass(/adyen-checkout__card__dual-branding__buttons--active/);

        // Complete the number
        await card.cardNumberInput.focus();
        await page.keyboard.press('End');
        await card.typeCardNumber(lastDigits);

        // Expect icon holder to have class adding full opacity
        await expect(card.dualBrandingIconsHolder).toHaveClass(/adyen-checkout__card__dual-branding__buttons--active/);
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

            // Check brand has not  been set in paymentMethod data
            let cardData: any = await page.evaluate('window.component.data');
            expect(cardData.paymentMethod.brand).toBe(undefined);

            // Expect dual brand icons not to be visible
            await expect(card.dualBrandingIconsHolder).not.toBeVisible();
        }
    );
});
