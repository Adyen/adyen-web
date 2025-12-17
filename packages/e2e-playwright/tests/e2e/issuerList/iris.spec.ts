import { test, expect } from '../../../fixtures/issuer-list.fixture';

test.describe('IRIS Payment Method', () => {
    test.describe('Bank List Flow', () => {
        test('should select issuer from the list, make payment, and return redirect action', async ({ page, iris }) => {
            let capturedResponseBody: any;

            // Intercept to capture the actual backend response
            await page.route('**/payments', async route => {
                const response = await route.fetch();
                capturedResponseBody = await response.json();
                
                expect(capturedResponseBody).toHaveProperty('action');
                expect(capturedResponseBody.action.type).toBe('redirect');

                // Fulfill with the actual response (component will receive it)
                await route.fulfill({ response });
            });

            await iris.switchToBankListMode();
            expect(await iris.isBankListModeSelected()).toBe(true);

            // The combobox should be visible in Bank List mode
            await expect(iris.selectorCombobox).toBeVisible();

            // Select an issuer from the dropdown (opens the listbox)
            await iris.selectIssuerOnSelectorDropdown('Piraeus Bank');

            await iris.pay();
        });
    });

    test.describe('QR Code Flow', () => {
        test('should display QR code image and data after generating', async ({ page, iris }) => {
            await iris.switchToQrCodeMode();
            expect(await iris.isQrCodeModeSelected()).toBe(true);
            await expect(iris.generateQrCodeButton).toBeVisible();

            const responsePromise = page.waitForResponse(response => response.url().includes('/payments') && response.status() === 200);
            await iris.generateQrCode();
            
            // Wait for the payment response with qrCode action
            const response = await responsePromise;
            const responseBody = await response.json();
            expect(responseBody).toHaveProperty('action');
            expect(responseBody.action.type).toBe('qrCode');

            // Wait for and verify QR code image is displayed
            await iris.waitForQrCode();
            await expect(iris.qrCodeImage).toBeVisible();
        });
    });
});
