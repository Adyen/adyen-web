import { test, expect } from '../../../fixtures/issuer-list.fixture';

test.describe('IRIS - Accessibility', () => {
    test('should have proper aria-selected attributes on segmented control tabs', async ({ iris }) => {
        // QR Code mode is selected by default
        await expect(iris.qrCodeModeTab).toHaveAttribute('aria-selected', 'true');
        await expect(iris.bankListModeTab).toHaveAttribute('aria-selected', 'false');
    });

    test('should have proper aria-controls attributes linking to content panels', async ({ iris }) => {
        await expect(iris.qrCodeModeTab).toHaveAttribute('aria-controls');
        await expect(iris.bankListModeTab).toHaveAttribute('aria-controls');
    });

    test('should update aria-selected when switching between modes', async ({ iris }) => {
        // Initial state: QR Code selected
        await expect(iris.qrCodeModeTab).toHaveAttribute('aria-selected', 'true');
        await expect(iris.bankListModeTab).toHaveAttribute('aria-selected', 'false');

        // Switch to Bank List mode
        await iris.switchToBankListMode();

        // Verify aria-selected is updated
        await expect(iris.qrCodeModeTab).toHaveAttribute('aria-selected', 'false');
        await expect(iris.bankListModeTab).toHaveAttribute('aria-selected', 'true');

        // Switch back to QR Code mode
        await iris.switchToQrCodeMode();

        // Verify aria-selected is updated again
        await expect(iris.qrCodeModeTab).toHaveAttribute('aria-selected', 'true');
        await expect(iris.bankListModeTab).toHaveAttribute('aria-selected', 'false');
    });

    test('should be keyboard navigable between segmented control tabs', async ({ page, iris }) => {
        // Focus on the QR Code tab
        await iris.qrCodeModeTab.focus();
        await expect(iris.qrCodeModeTab).toBeFocused();

        // Tab to Bank List tab
        await page.keyboard.press('Tab');
        await expect(iris.bankListModeTab).toBeFocused();

        // Press Enter to activate Bank List mode
        await page.keyboard.press('Enter');

        // Verify Bank List mode is now selected
        expect(await iris.isBankListModeSelected()).toBe(true);
        await expect(iris.bankListModeTab).toHaveAttribute('aria-selected', 'true');
    });

});
