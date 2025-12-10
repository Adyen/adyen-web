import { test, expect } from '../../../fixtures/issuer-list.fixture';

test.describe('IRIS Payment Method', () => {
    test.describe('Bank List Flow', () => {
        test('should select issuer from the list, make payment, and return redirect action', async ({ page, iris }) => {

            await iris.switchToBankListMode();
            expect(await iris.isBankListModeSelected()).toBe(true);
            await expect(iris.selectorList).toBeVisible();

            // Select an issuer from the list (Piraeus Bank)
            await iris.selectIssuer('Piraeus Bank');

            const responsePromise = page.waitForResponse(response => response.url().includes('/payments') && response.status() === 200);
            await expect(iris.payButton).toBeVisible();
            await iris.submitPayment();

            // Wait for the response and verify redirect action
            const response = await responsePromise;
            const responseBody = await response.json();

            expect(responseBody).toHaveProperty('action');
            expect(responseBody.action.type).toBe('redirect');
        });
    });

    test.describe('QR Code Flow', () => {
        test('should display QR code image and data after generating', async ({ iris }) => {
            await iris.switchToQrCodeMode();
            expect(await iris.isQrCodeModeSelected()).toBe(true);
            await expect(iris.generateQrCodeButton).toBeVisible();
            await iris.generateQrCode();

            // Wait for and verify QR code image is displayed
            await iris.waitForQrCode();
            await expect(iris.qrCodeImage).toBeVisible();
        });
    });
});
