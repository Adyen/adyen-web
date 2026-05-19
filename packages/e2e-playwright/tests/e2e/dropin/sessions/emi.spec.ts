import { test, expect } from '../../../../fixtures/dropin.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { EMI } from '../../../../models/emi';

test.describe('Dropin - Sessions - EMI', () => {
    test('should display EMI tile with subtitle and embedded card form', async ({ dropinWithSession, page }) => {
        await dropinWithSession.goto(URL_MAP.dropinSessionsIndia);

        const emiPaymentMethodHeader = dropinWithSession.getPaymentMethodHeader('EMI');
        await expect(emiPaymentMethodHeader.rootElement).toBeVisible();

        await dropinWithSession.selectNonStoredPaymentMethod('emi');

        const emi = new EMI(page);

        await expect(emi.cardNumberField).toBeVisible();
    });
});
