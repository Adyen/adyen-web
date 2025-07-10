import { test, expect } from '../../../fixtures/card.fixture';
import { BCMC_DUAL_BRANDED_VISA, DUAL_BRANDED_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE, VISA_CARD } from '../../utils/constants';
import { URL_MAP } from '../../../fixtures/URL_MAP';

test('#1 BCMC logo should have correct alt text', async ({ bcmc }) => {
    await bcmc.goto(URL_MAP.bcmc);
    await bcmc.typeCardNumber('41');
    expect(bcmc.rootElement.getByAltText(/bancontact card/i)).toBeTruthy();
});

test('#2 Visa logo should have correct alt text', async ({ bcmc }) => {
    await bcmc.goto(URL_MAP.bcmc);
    await bcmc.typeCardNumber(VISA_CARD);
    expect(bcmc.rootElement.getByAltText(/visa/i)).toBeTruthy();
});

test(
    '#3 Enter card number (co-branded bcmc/visa) & fill expiryDate' +
        'then click Visa logo and expect cvc input to be visible & comp to not be valid' +
        'then click BCMC logo and expect cvc Input to be hidden & comp to be valid',
    async ({ page, bcmc }) => {
        await bcmc.goto(URL_MAP.bcmc);
        await bcmc.typeCardNumber(BCMC_DUAL_BRANDED_VISA);
        await bcmc.typeExpiryDate(TEST_DATE_VALUE);

        await expect(bcmc.dualBrandingButtonsHolder).toBeVisible();

        // Select visa
        const visaBtn = await bcmc.selectDualBrandUIItem(/visa/i);
        await visaBtn.click();

        await expect(bcmc.cvcInput).toBeVisible();

        expect(bcmc.cvcInput).toHaveAttribute('aria-required', 'true');
        await page.waitForFunction(() => globalThis.component.isValid === false);

        // Select bcmc
        const bcmcBtn = await bcmc.selectDualBrandUIItem(/bancontact/i, false);
        await bcmcBtn.click();

        expect(bcmc.cvcField).toBeHidden();

        await page.waitForFunction(() => globalThis.component.isValid === true);
    }
);

test(
    '#4 Enter card number (co-branded bcmc/visa) & fill expiryDate' +
        'then click Visa logo and expect comp to not be valid' +
        'then enter CVC and expect comp to be valid',
    async ({ bcmc, page }) => {
        await bcmc.goto(URL_MAP.bcmc);
        await bcmc.typeCardNumber(BCMC_DUAL_BRANDED_VISA);
        await bcmc.typeExpiryDate(TEST_DATE_VALUE);

        await expect(bcmc.dualBrandingButtonsHolder).toBeVisible();

        // Select visa
        const visaBtn = await bcmc.selectDualBrandUIItem(/visa/i);
        await visaBtn.click();

        await page.waitForFunction(() => globalThis.component.isValid === false);

        await bcmc.typeCvc(TEST_CVC_VALUE);
        await page.waitForFunction(() => globalThis.component.isValid === true);
    }
);

test(
    '#5 Enter Visa card number ' +
        'then delete it' +
        'then re-add it' +
        'and expect Visa logo to be shown a second time (showing CSF has reset state)',
    async ({ bcmc }) => {
        await bcmc.goto(URL_MAP.bcmc);
        await bcmc.typeCardNumber(DUAL_BRANDED_CARD);
        expect(bcmc.rootElement.getByAltText(/visa/i)).toBeTruthy();
        await bcmc.deleteCardNumber();
        expect(bcmc.rootElement.getByAltText(/bancontact card/i)).toBeTruthy();
        await bcmc.typeCardNumber(DUAL_BRANDED_CARD);
        expect(bcmc.rootElement.getByAltText(/visa/i)).toBeTruthy();
    }
);
