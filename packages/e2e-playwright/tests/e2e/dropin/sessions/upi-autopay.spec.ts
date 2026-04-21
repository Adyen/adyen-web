import dotenv from 'dotenv';
import { test, expect } from '../../../../fixtures/dropin.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { UPI } from '../../../../models/upi';

dotenv.config();

test.describe('Dropin - Sessions - UPI Autopay', () => {
    test('should display mandate info in the UPI payment method and render the QR code', async ({ dropinWithSession, page }) => {
        await dropinWithSession.goto(URL_MAP.dropinSessionsIndiaAutoPay);

        await dropinWithSession.selectNonStoredPaymentMethod('upi');

        const upi = new UPI(page);

        await expect(upi.mandateInfo).toBeVisible();

        await upi.pay({ name: 'Generate QR code' });

        await upi.isQrCodeVisible();
    });
});
