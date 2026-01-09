import { test, expect } from '../../../fixtures/issuer-list.fixture';
import { URL_MAP } from '../../../fixtures/URL_MAP';

test.describe('IRIS Payment Method', () => {
    test('Bank List Flow - should select issuer from the list, make payment, and return redirect action', async ({ page, iris }) => {
        await iris.switchToBankListMode();
        expect(await iris.isBankListModeSelected()).toBe(true);
        
        // The combobox should be visible in Bank List mode
        await expect(iris.selectorCombobox).toBeVisible();
        
        // Select an issuer from the dropdown (opens the listbox)
        await iris.selectIssuerOnSelectorDropdown('Piraeus Bank');
        
        await iris.pay();
        
        await expect(iris.page).not.toHaveURL(URL_MAP.iris, { timeout: 5000 }); 
    });
    test('QR Code Flow - should display QR code image and data after generating', async ({ page, iris }) => {
        await iris.switchToQrCodeMode();
        expect(await iris.isQrCodeModeSelected()).toBe(true);
        await expect(iris.generateQrCodeButton).toBeVisible();
        await iris.generateQrCode();
        
        // Wait for and verify QR code image is displayed
        await iris.waitForQrCode();
        await expect(iris.qrCodeImage).toBeVisible();
    });
});
