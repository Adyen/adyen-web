import { test, expect } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { PLCC_NO_LUHN_NO_DATE_WOULD_FAIL_LUHN, TEST_CVC_VALUE } from '../../../../utils/constants';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';

test.describe('Testing binLookup endpoint for a response that should indicate a luhn check is not required)', () => {
    test('Test a PLCC card, that does not require a date, becomes valid with a number that fails the luhn check', async ({ card, page }) => {
        //
        const componentConfig = { brands: ['mc', 'visa', 'amex', 'bcmc', 'synchrony_plcc'] };

        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        await card.isComponentVisible();

        // Number that identifies as plcc, with no luhn required, but that also fails luhn
        await card.typeCardNumber(PLCC_NO_LUHN_NO_DATE_WOULD_FAIL_LUHN);

        // Confirm plcc brand
        let brandingIconSrc = await card.brandingIcon.getAttribute('src');
        expect(brandingIconSrc).toContain('synchrony_plcc.svg');

        // Confirm date is hidden
        await expect(card.expiryDateField).not.toBeVisible();

        // Fill cvc
        await card.typeCvc(TEST_CVC_VALUE);

        // PM is valid
        let cardValid = await page.evaluate('window.component.isValid');
        expect(cardValid).toEqual(true);

        // Delete number
        await card.deleteCardNumber();

        // Allow time for icon to load
        await page.waitForTimeout(500);

        // UI reset
        brandingIconSrc = await card.brandingIcon.getAttribute('src');
        expect(brandingIconSrc).toContain('nocard.svg');

        // Confirm date is visible again
        await expect(card.expiryDateField).toBeVisible();

        // PM is not valid
        cardValid = await page.evaluate('window.component.isValid');
        expect(cardValid).toEqual(false);
    });
});
