import { test, expect } from '../../../../fixtures/card.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { BCMC_CARD, BCMC_DUAL_BRANDED_VISA, UNKNOWN_VISA_CARD } from '../../../utils/constants';

test.describe('Testing Bancontact, with dual branded cards, how UI resets', () => {
    test(
        '#1 should sort brands with Bcmc first and show only bcmc logo after deleting digits',
        async ({ bcmc }) => {
            await bcmc.goto(URL_MAP.bcmc);

            await bcmc.isComponentVisible();

            await bcmc.fillCardNumber(BCMC_CARD);

            await bcmc.waitForVisibleDualBrandIcons(2);

            const brands = await bcmc.dualBrandIcons;

            expect(brands).toHaveLength(2);

            const brandAlts = await Promise.all(brands.map(brand => brand.getAttribute('alt')));
            expect(brandAlts).toHaveLength(2);
            expect(brandAlts).toEqual(expect.arrayContaining(['Bancontact card', 'Maestro']));

            await bcmc.deleteCardNumber();

            // Now only a single brand
            await bcmc.waitForVisibleDualBrandIcons(1);

            const [brand] = await bcmc.dualBrandIcons;

            expect(brand).toHaveAttribute('alt', 'Bancontact card');
        }
    );

    test(
        '#2 should keep BCMC branding when pasting unrecognised Visa number over dual branded card',
        async ({ bcmc }) => {
            await bcmc.goto(URL_MAP.bcmc);

            await bcmc.isComponentVisible();

            await bcmc.typeCardNumber(BCMC_CARD);

            await bcmc.waitForVisibleDualBrandIcons();

            // "paste"
            await bcmc.fillCardNumber(UNKNOWN_VISA_CARD);

            await bcmc.waitForVisibleDualBrandIcons(1);

            const [firstBrand, secondBrand] = await bcmc.dualBrandIcons;

            // Remains a single brand
            expect(firstBrand).toHaveAttribute('alt', /bancontact/i);
            expect(secondBrand).toBeUndefined();
        }
    );

    test(
        '#3 should reset to BCMC branding and hide CVC after pasting unrecognised number over visa-selected dual branded card',
        async ({ bcmc }) => {
            await bcmc.goto(URL_MAP.bcmc);

            await bcmc.isComponentVisible();

            await bcmc.fillCardNumber(BCMC_DUAL_BRANDED_VISA);

            await expect(bcmc.isDualBrandSelectionVisible()).resolves.toBe(true);

            // Select visa
            await bcmc.selectBrand(/visa/i);

            await expect(bcmc.cvcField).toBeVisible();

            // "paste"
            await bcmc.fillCardNumber(UNKNOWN_VISA_CARD);

            await bcmc.waitForVisibleDualBrandIcons(1);

            const [firstBrand, secondBrand] = await bcmc.dualBrandIcons;

            // Returns to a Bcmc
            expect(firstBrand).toHaveAttribute('alt', /bancontact/i);
            expect(secondBrand).toBeUndefined();

            // with hidden cvc
            await expect(bcmc.cvcField).toBeHidden();
        }
    );

    test(
        '#4 should reset to BCMC branding and hide CVC after deleting visa-selected dual branded card number',
        async ({ bcmc }) => {
            await bcmc.goto(URL_MAP.bcmc);

            await bcmc.isComponentVisible();

            await bcmc.fillCardNumber(BCMC_DUAL_BRANDED_VISA);

            await expect(bcmc.isDualBrandSelectionVisible()).resolves.toBe(true);

            // Select visa
            await bcmc.selectBrand(/visa/i);

            await bcmc.deleteCardNumber();

            await bcmc.waitForVisibleDualBrandIcons(1);

            const [firstBrand, secondBrand] = await bcmc.dualBrandIcons;

            // Returns to a Bcmc
            expect(firstBrand).toHaveAttribute('alt', /bancontact/i);
            expect(secondBrand).toBeUndefined();

            // with hidden cvc
            await expect(bcmc.cvcField).toBeHidden();
        }
    );
});
