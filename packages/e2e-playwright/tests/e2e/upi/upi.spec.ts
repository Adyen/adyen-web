import { test as base, expect } from '../../../fixtures/base-fixture';
import { UPI } from '../../../models/upi';
import { URL_MAP } from '../../../fixtures/URL_MAP';
import { MOBILE_USER_AGENT, SMALL_MOBILE_VIEWPORT } from '../../utils/constants';

type Fixture = {
    upiPage: UPI;
};

const test = base.extend<Fixture>({
    upiPage: async ({ page }, use) => {
        const upiPage = new UPI(page);
        await use(upiPage);
    }
});

test.describe('UPI - QR Code Flow (Desktop)', () => {
    test('should complete payment with QR code generation', async ({ upiPage }) => {
        await upiPage.goto(URL_MAP.upi);

        await expect(upiPage.intentArea).not.toBeVisible();
        await expect(upiPage.appList).not.toBeVisible();

        await upiPage.pay({ name: /generate qr code/i });

        await upiPage.isQrCodeVisible();
        await expect(upiPage.qrCodeImage).toBeVisible();
    });
});

test.describe('UPI - Intent Flow (Mobile)', () => {
    test.use({
        viewport: SMALL_MOBILE_VIEWPORT,
        userAgent: MOBILE_USER_AGENT
    });

    test('should show error when clicking Continue without selecting an app, then complete after selection', async ({ upiPage, page }) => {
        await upiPage.goto(URL_MAP.upi);

        await expect(upiPage.intentArea).toBeVisible();
        await expect(upiPage.appList).toBeVisible();

        await upiPage.pay({ name: /continue/i });
        await expect(upiPage.errorAlert).toBeVisible();

        await upiPage.selectApp(/google pay/i);

        await upiPage.pay({ name: /continue/i });

        await expect(upiPage.intentArea).not.toBeVisible();
    });

    test('should show dropdown for low-priority apps and allow selection from it', async ({ upiPage, page }) => {
        await upiPage.goto(URL_MAP.upi);

        await expect(upiPage.intentArea).toBeVisible();
        await expect(upiPage.appList).toBeVisible();
        await expect(upiPage.appDropdown).toBeVisible();

        await upiPage.selectAppFromDropdown(/.+/);

        await upiPage.pay({ name: /continue/i });

        await expect(upiPage.intentArea).not.toBeVisible();
    });
});
