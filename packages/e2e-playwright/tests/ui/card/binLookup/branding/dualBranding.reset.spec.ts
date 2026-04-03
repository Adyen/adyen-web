import { expect, test } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import { BCMC_CARD, BCMC_DUAL_BRANDED_VISA, REGULAR_TEST_CARD } from '../../../../utils/constants';

import { binLookupMock } from '../../../../../mocks/binLookup/binLookup.mock';
import { dualBrandedBcmcAndVisa } from '../../../../../mocks/binLookup/binLookup.data';

const componentConfig = { brands: ['mc', 'visa', 'amex', 'maestro', 'bcmc'] };

test.describe('Card - Testing resetting after binLookup has given a dual brand result', () => {
    test(
        '#1 should reset dual branding when all digits are deleted',
        async ({ card, page }) => {
            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

            await card.typeCardNumber(BCMC_CARD);

            // Expect brand selection to be visible (EU dual brand)
            await expect(card.dualBrandSelector).toBeVisible();

            // Expect brand selection to be visible
            await expect(card.isDualBrandSelectionVisible()).resolves.toBe(true);

            // Expect contextual label to be visible
            await expect(card.isDualBrandContextualLabelVisible()).resolves.toBe(true);

            // Delete all digits
            await card.deleteCardNumber();

            // Type a shorter, non-dual-branded portion
            await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA.substring(0, 6));

            // Expect brand selection to be hidden
            await expect(card.dualBrandSelector).not.toBeVisible();

            // Expect brand selection to be hidden
            await expect(card.isDualBrandSelectionVisible()).resolves.toBe(false);

            // Expect contextual label to be hidden
            await expect(card.isDualBrandContextualLabelVisible()).resolves.toBe(false);

            // Check brand has not been set in paymentMethod data
            let cardData: any = await page.evaluate('window.component.data');
            expect(cardData.paymentMethod.brand).toBe(undefined);
        }
    );

    test(
        '#2 should reset dual branding when switching to a single brand card',
        async ({ card, page }) => {
            await binLookupMock(page, dualBrandedBcmcAndVisa);

            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

            await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

            await expect(card.isDualBrandSelectionVisible()).resolves.toBe(true);

            // Select visa
            await card.selectBrand(/visa/i);

            // Check visa brand has been set in paymentMethod data
            let cardData: any = await page.evaluate('window.component.data');
            expect(cardData.paymentMethod.brand).toEqual('visa');

            // Select bcmc
            await card.selectBrand(/bancontact/i);

            // Check bcmc brand has been set in paymentMethod data
            cardData = await page.evaluate('window.component.data');
            expect(cardData.paymentMethod.brand).toEqual('bcmc');

            // Delete all digits
            await card.deleteCardNumber();

            // Type new (single brand) card number
            await card.typeCardNumber(REGULAR_TEST_CARD);

            // Expect brand selection to be hidden
            await expect(card.dualBrandSelector).not.toBeVisible();

            // Expect brand selection to be hidden
            await expect(card.isDualBrandSelectionVisible()).resolves.toBe(false);

            // Check brand has not been set in paymentMethod data
            cardData = await page.evaluate('window.component.data');
            expect(cardData.paymentMethod.brand).toBe(undefined);
        }
    );

    test(
        '#3 should restore dual branding when same number is retyped after deletion',
        async ({ card }) => {
            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

            await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

            await expect(card.dualBrandSelector).toBeVisible();
            await expect(card.isDualBrandSelectionVisible()).resolves.toBe(true);

            // Delete all digits and retype
            await card.deleteCardNumber();
            await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

            // Expect brand selection to be visible
            await expect(card.dualBrandSelector).toBeVisible();

            // Expect brand selection to be visible
            await expect(card.isDualBrandSelectionVisible()).resolves.toBe(true);
        }
    );
});
