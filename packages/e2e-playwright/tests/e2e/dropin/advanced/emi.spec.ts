import { test, expect } from '../../../../fixtures/dropin.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { EMI } from '../../../../models/emi';

test.describe('Dropin - Sessions - EMI', () => {
    test('should display EMI tile with subtitle and embedded card form', async ({ dropin, page }) => {
        await dropin.goto(URL_MAP.dropinWithAdvancedIndia);

        const emiPaymentMethodHeader = dropin.getPaymentMethodHeader('EMI');
        await expect(emiPaymentMethodHeader.rootElement).toBeVisible();

        await dropin.selectNonStoredPaymentMethod('emi');

        const emi = new EMI(page);

        await expect(emi.cardNumberField).toBeVisible();
    });
});
