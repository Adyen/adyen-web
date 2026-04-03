import { test, expect } from '../../../../fixtures/card.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { BCMC_CARD, BCMC_DUAL_BRANDED_VISA, UNKNOWN_VISA_CARD } from '../../../utils/constants';

test.describe('Testing Bancontact, with dual branded cards, how UI resets', () => {
    test(
        '#1 should sort brands with Bcmc first and show only bcmc logo after deleting digits',
        async ({ bcmc }) => {
            await bcmc.goto(URL_MAP.bcmc);

            await bcmc.isComponentVisible();

            await bcmc.typeCardNumber(BCMC_CARD);

            await expect(bcmc.isDualBrandSelectionVisible()).resolves.toBe(true);
            await expect(bcmc.getBrandOptionCount()).resolves.toBe(2);

            await bcmc.deleteCardNumber();

            // Now only a single brand
            await expect(bcmc.isDualBrandSelectionVisible()).resolves.toBe(false);
            await expect(bcmc.brandingIcon).toHaveAttribute('alt', 'Bancontact card');
        }
    );

    test(
        '#2 should keep BCMC branding when pasting unrecognised Visa number over dual branded card',
        async ({ bcmc }) => {
            await bcmc.goto(URL_MAP.bcmc);

            await bcmc.isComponentVisible();

            await bcmc.typeCardNumber(BCMC_CARD);

            await expect(bcmc.isDualBrandSelectionVisible()).resolves.toBe(true);

            // "paste"
            await bcmc.deleteCardNumber();
            await bcmc.fillCardNumber(UNKNOWN_VISA_CARD);

            // Remains a single brand
            await expect(bcmc.isDualBrandSelectionVisible()).resolves.toBe(false);
            await expect(bcmc.brandingIcon).toHaveAttribute('alt', /bancontact/i);
        }
    );

    test(
        '#3 should reset to BCMC branding and hide CVC after pasting unrecognised number over visa-selected dual branded card',
        async ({ bcmc }) => {
            await bcmc.goto(URL_MAP.bcmc);

            await bcmc.isComponentVisible();

            await bcmc.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

            await expect(bcmc.isDualBrandSelectionVisible()).resolves.toBe(true);
            await expect(bcmc.getBrandOptionCount()).resolves.toBe(2);

            // Select visa
            await bcmc.selectBrand(/visa/i);

            await expect(bcmc.cvcField).toBeVisible();

            // "paste"
            await bcmc.deleteCardNumber();
            await bcmc.fillCardNumber(UNKNOWN_VISA_CARD);

            // Returns to a Bcmc
            await expect(bcmc.isDualBrandSelectionVisible()).resolves.toBe(false);
            await expect(bcmc.brandingIcon).toHaveAttribute('alt', /bancontact/i);

            // with hidden cvc
            await expect(bcmc.cvcField).toBeHidden();
        }
    );

    test(
        '#4 Fill in dual branded card then ' + 'select visa, then' + 'delete number and see that UI returns to looking like a BCMC card',
        async ({ bcmc }) => {
            await bcmc.goto(URL_MAP.bcmc);

            await bcmc.isComponentVisible();

            await bcmc.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

            await expect(bcmc.isDualBrandSelectionVisible()).resolves.toBe(true);
            await expect(bcmc.getBrandOptionCount()).resolves.toBe(2);

            // Select visa
            await bcmc.selectBrand(/visa/i);
            await expect(bcmc.isBrandSelected(/visa/i)).resolves.toBe(true);
            await bcmc.deleteCardNumber();

            // Returns to a Bcmc
            await expect(bcmc.isDualBrandSelectionVisible()).resolves.toBe(false);
            await expect(bcmc.brandingIcon).toHaveAttribute('alt', /bancontact/i);

            // with hidden cvc
            await expect(bcmc.cvcField).toBeHidden();
        }
    );
});
