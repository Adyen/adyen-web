import { test, expect } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { PLCC_NO_LUHN_NO_DATE, PLCC_WITH_LUHN_NO_DATE_WOULD_FAIL_LUHN, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../../../utils/constants';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import LANG from '../../../../../../server/translations/en-US.json';

const PAN_ERROR_NOT_VALID = LANG['cc.num.902'];

test.describe('Testing binLookup/plcc/pasting fny: test what happens when cards that do, or do not, require a luhn check, are pasted in', () => {
    test('#1 Test that the paste event triggers the correct response and the validation rules are updated accordingly', async ({ card, page }) => {
        //
        const componentConfig = { brands: ['mc', 'visa', 'amex', 'bcmc', 'synchrony_plcc'] };

        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        await card.isComponentVisible();

        /**
         * Type number that identifies as plcc, no luhn required, but that fails luhn
         */
        await card.fillCardNumber(PLCC_WITH_LUHN_NO_DATE_WOULD_FAIL_LUHN);
        await page.waitForTimeout(100);

        await card.typeExpiryDate(TEST_DATE_VALUE);
        await card.typeCvc(TEST_CVC_VALUE);

        // Expect the card not to be valid
        await card.pay();

        await expect(card.cardNumberErrorElement).toBeVisible();
        await expect(card.cardNumberErrorElement).toHaveText(PAN_ERROR_NOT_VALID);

        // "Paste" number that identifies as plcc, luhn required
        await card.fillCardNumber(PLCC_NO_LUHN_NO_DATE);
        await page.waitForTimeout(100);

        // If correct events have fired expect the card to be valid i.e. no error message when pressing pay
        await card.pay();
        await expect(card.cardNumberErrorElement).not.toBeVisible();
    });
});
