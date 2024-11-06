import { test, expect } from '../../../fixtures/card.fixture';
import { BCMC_DUAL_BRANDED_VISA, DUAL_BRANDED_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE, VISA_CARD } from '../../utils/constants';

test('BCMC logo should have correct alt text', async ({ bcmc }) => {
    await bcmc.typeCardNumber('41');
    expect(bcmc.rootElement.getByAltText(/bancontact card/i)).toBeTruthy();
});

test('Visa logo should have correct alt text', async ({ bcmc }) => {
    await bcmc.typeCardNumber(VISA_CARD);
    expect(bcmc.rootElement.getByAltText(/visa/i)).toBeTruthy();
});

test(
    '#4 Enter card number (co-branded bcmc/visa) ' +
        'then complete expiryDate and expect comp to be valid' +
        'then click Visa logo and expect comp to not be valid' +
        'then click BCMC logo and expect comp to be valid again',
    async ({ page, bcmc }) => {
        await bcmc.typeCardNumber(BCMC_DUAL_BRANDED_VISA);
        await bcmc.typeExpiryDate(TEST_DATE_VALUE);
        expect(bcmc.cvcField).toBeHidden();
        await page.waitForFunction(() => globalThis.component.isValid === true);

        await bcmc.rootElement.getByAltText(/visa/i).first().click();
        await bcmc.cvcInput.waitFor({ state: 'visible' });
        expect(bcmc.cvcInput).toHaveAttribute('aria-required', 'true');
        await page.waitForFunction(() => globalThis.component.isValid === false);

        await bcmc.rootElement
            .getByAltText(/bancontact card/i)
            .first()
            .click();
        await bcmc.cvcField.waitFor({ state: 'hidden' });
        await page.waitForFunction(() => globalThis.component.isValid === true);
    }
);

test(
    '#5 Enter card number, that we mock to co-branded bcmc/visa ' +
        'then complete expiryDate and expect comp to be valid' +
        'then click Visa logo and expect comp to not be valid' +
        'then enter CVC and expect comp to be valid',
    async ({ bcmc, page }) => {
        await bcmc.typeCardNumber(BCMC_DUAL_BRANDED_VISA);
        await bcmc.typeExpiryDate(TEST_DATE_VALUE);
        await page.waitForFunction(() => globalThis.component.isValid === true);

        await bcmc.rootElement.getByAltText(/visa/i).first().click();
        await page.waitForFunction(() => globalThis.component.isValid === false);

        await bcmc.typeCvc(TEST_CVC_VALUE);
        await page.waitForFunction(() => globalThis.component.isValid === true);
    }
);

test(
    '#6 Enter Visa card number ' +
        'then delete it' +
        'then re-add it' +
        'and expect Visa logo to be shown a second time (showing CSF has reset state)',
    async ({ bcmc }) => {
        await bcmc.typeCardNumber(DUAL_BRANDED_CARD);
        expect(bcmc.rootElement.getByAltText(/visa/i)).toBeTruthy();
        await bcmc.deleteCardNumber();
        expect(bcmc.rootElement.getByAltText(/bancontact card/i)).toBeTruthy();
        await bcmc.typeCardNumber(DUAL_BRANDED_CARD);
        expect(bcmc.rootElement.getByAltText(/visa/i)).toBeTruthy();
    }
);
