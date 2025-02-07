import { expect, test } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import { BCMC_DUAL_BRANDED_VISA } from '../../../../utils/constants';

import LANG from '../../../../../../server/translations/en-US.json';

const PAN_ERROR_NOT_COMPLETE = LANG['cc.num.901'];

const componentConfig = {
    brands: ['mc', 'visa', 'amex', 'maestro', 'bcmc']
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
});
