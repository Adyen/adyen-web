import { test as base, expect } from '../../../fixtures/base-fixture';
import { UPI } from '../../../models/upi';
import { URL_MAP } from '../../../fixtures/URL_MAP';

type Fixture = {
    upiPage: UPI;
};

const test = base.extend<Fixture>({
    upiPage: async ({ page }, use) => {
        const upiPage = new UPI(page);
        await use(upiPage);
    }
});

test.describe('UPI - Autopay Mandate Flow (Desktop)', () => {
    test('should display mandate info alert and render the QR code', async ({ upiPage }) => {
        await upiPage.goto(URL_MAP.upiAutoPay);

        await expect(upiPage.mandateInfo).toBeVisible();

        await upiPage.pay({ name: /generate qr code/i });

        await upiPage.isQrCodeVisible();
        await expect(upiPage.qrCodeImage).toBeVisible();
    });
});
