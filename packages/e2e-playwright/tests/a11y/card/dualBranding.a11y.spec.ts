import { test, expect } from '../../../fixtures/card.fixture';
import { getStoryUrl } from '../../utils/getStoryUrl';
import { URL_MAP } from '../../../fixtures/URL_MAP';
import { BCMC_DUAL_BRANDED_VISA } from '../../utils/constants';
import LANG from '../../../../server/translations/en-US.json';
import { binLookupMock } from '../../../mocks/binLookup/binLookup.mock';
import { dualBrandedVisaAndBcmc } from '../../../mocks/binLookup/binLookup.data';

const DUAL_BRAND_CONTEXTUAL_TEXT = LANG['creditCard.dualBrand.description'];

const componentConfig = {
    brands: ['mc', 'visa', 'amex', 'maestro', 'bcmc']
};

test.describe('Card - Dual Branding Accessibility', () => {
    test.describe('Screen Reader Announcements', () => {
        test('should have aria-live region with contextual text after typing 11 digits', async ({ card }) => {
            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

            const firstDigits = BCMC_DUAL_BRANDED_VISA.substring(0, 11);

            await card.typeCardNumber(firstDigits);

            // Wait for dual brand selector to appear
            await expect(card.dualBrandSelector).toBeVisible();

            // Verify aria-live region exists and contains the contextual text
            await expect(card.dualBrandLiveRegion).toBeVisible();
            await expect(card.dualBrandLiveRegion).toHaveAttribute('aria-live', 'polite');
            await expect(card.dualBrandLiveRegion).toHaveText(DUAL_BRAND_CONTEXTUAL_TEXT);
        });

        test('should have role="group" with aria-label for brand selector', async ({ card }) => {
            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

            await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA.substring(0, 11));

            await expect(card.dualBrandSelector).toBeVisible();
            await expect(card.dualBrandSelector).toHaveAttribute('role', 'group');
            await expect(card.dualBrandSelector).toHaveAttribute('aria-label', DUAL_BRAND_CONTEXTUAL_TEXT);
        });
    });

    test.describe('Keyboard Navigation', () => {
        // Note: Tab navigation to brand buttons only works after the full card number is typed.
        test('should allow Tab navigation to brand buttons after typing full card number', async ({ card, page }) => {
            await binLookupMock(page, dualBrandedVisaAndBcmc);
            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));
            await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

            await expect(card.dualBrandSelector).toBeVisible();

            // Tab from card number input to first brand button
            await page.keyboard.press('Tab');

            // First brand button should be focused
            const visaButton = card.getBrandButton(/visa/i);
            await expect(visaButton).toBeFocused();
        });

        test('should toggle brand selection with Space key', async ({ card, page }) => {
            await binLookupMock(page, dualBrandedVisaAndBcmc);
            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

            await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

            await expect(card.dualBrandSelector).toBeVisible();

            // First brand (visa) should be selected by default
            const visaButton = card.getBrandButton(/visa/i);
            const bancontactButton = card.getBrandButton(/bancontact/i);

            await expect(visaButton).toHaveAttribute('aria-pressed', 'true');
            await expect(bancontactButton).toHaveAttribute('aria-pressed', 'false');

            // Tab to first button, then Tab to second button
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');

            // Press Space to select Bancontact
            await page.keyboard.press('Space');

            // Bancontact should now be selected
            await expect(bancontactButton).toHaveAttribute('aria-pressed', 'true');
            await expect(visaButton).toHaveAttribute('aria-pressed', 'false');
        });

        test('should toggle brand selection with Enter key', async ({ card, page }) => {
            await binLookupMock(page, dualBrandedVisaAndBcmc);
            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

            await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

            await expect(card.dualBrandSelector).toBeVisible();

            const visaButton = card.getBrandButton(/visa/i);
            const bancontactButton = card.getBrandButton(/bancontact/i);

            await expect(visaButton).toHaveAttribute('aria-pressed', 'true');

            // Tab to second button and press Enter
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Enter');

            // Bancontact should now be selected
            await expect(bancontactButton).toHaveAttribute('aria-pressed', 'true');
            await expect(visaButton).toHaveAttribute('aria-pressed', 'false');
        });

        test('should have both brand buttons in tab order', async ({ card, page }) => {
            await binLookupMock(page, dualBrandedVisaAndBcmc);
            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

            await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

            await expect(card.dualBrandSelector).toBeVisible();

            const visaButton = card.getBrandButton(/visa/i);
            const bancontactButton = card.getBrandButton(/bancontact/i);

            // Buttons should not have tabindex="-1"
            await expect(visaButton).not.toHaveAttribute('tabindex', '-1');
            await expect(bancontactButton).not.toHaveAttribute('tabindex', '-1');
        });
    });

    test.describe('Click Selection', () => {
        // Note: Keyboard selection via Tab only works after full card number is typed.
        // Click selection works immediately after dual brand appears.
        test('should allow brand selection via click with incomplete card number', async ({ card }) => {
            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

            await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA.substring(0, 11));

            await expect(card.dualBrandSelector).toBeVisible();

            // Click to select Bancontact
            await card.selectBrand(/bancontact/i);

            // Bancontact should be selected
            await expect(card.isBrandSelected(/bancontact/i)).resolves.toBe(true);

            // No error should be shown
            await expect(card.cardNumberErrorElement).not.toBeVisible();
        });
    });

    test.describe('aria-pressed State', () => {
        test('should have mutually exclusive aria-pressed state on brand buttons', async ({ card, page }) => {
            await binLookupMock(page, dualBrandedVisaAndBcmc);
            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

            await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA.substring(0, 11));

            await expect(card.dualBrandSelector).toBeVisible();

            const visaButton = card.getBrandButton(/visa/i);
            const bancontactButton = card.getBrandButton(/bancontact/i);

            // Initially visa is selected
            await expect(visaButton).toHaveAttribute('aria-pressed', 'true');
            await expect(bancontactButton).toHaveAttribute('aria-pressed', 'false');

            // Click Bancontact
            await card.selectBrand(/bancontact/i);

            // Now Bancontact is selected, visa is not
            await expect(bancontactButton).toHaveAttribute('aria-pressed', 'true');
            await expect(visaButton).toHaveAttribute('aria-pressed', 'false');

            // Click visa again
            await card.selectBrand(/visa/i);

            // Back to visa selected
            await expect(visaButton).toHaveAttribute('aria-pressed', 'true');
            await expect(bancontactButton).toHaveAttribute('aria-pressed', 'false');
        });
    });
});
