import { test, expect } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { PLCC_NO_LUHN_HIDDEN_DATE_WOULD_FAIL_LUHN, TEST_CVC_VALUE } from '../../../../utils/constants';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';

test.describe('Testing binLookup endpoint for a response that should indicate a luhn check is not required)', () => {
    test('Test a PLCC card, that does not require a date, becomes valid with a number that fails the luhn check', async ({ card, page }) => {
        //
        const componentConfig = { brands: ['mc', 'visa', 'amex', 'bcmc', 'synchrony_plcc'] };

        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        await card.isComponentVisible();

        // Number that identifies as plcc, with no luhn required, but that also fails luhn
        await card.typeCardNumber(PLCC_NO_LUHN_HIDDEN_DATE_WOULD_FAIL_LUHN);

        // Confirm plcc brand
        await expect(card.brandingIcon).toHaveAttribute('src', /\/synchrony_plcc\.svg$/);

        // Confirm date is hidden
        await expect(card.expiryDateField).not.toBeVisible();

        // Fill cvc
        await card.typeCvc(TEST_CVC_VALUE);

        // PM is valid
        const cardValid = await page.evaluate('window.component.isValid');
        expect(cardValid).toEqual(true);

        // Delete number
        await card.deleteCardNumber();

        // UI reset
        await expect(card.brandingIcon).toHaveAttribute('src', /\/nocard\.svg$/);

        // Confirm date is required again
        await expect(card.expiryDateField).toBeVisible();

        // PM is not valid
        await page.waitForFunction(() => window['component'].isValid === false);
    });
});
