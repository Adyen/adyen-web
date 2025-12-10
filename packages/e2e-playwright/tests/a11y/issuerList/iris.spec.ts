import { test, expect } from '../../../fixtures/issuer-list.fixture';

test.describe('IRIS - Accessibility', () => {
    test('should have proper aria-expanded attributes on segmented control buttons', async ({ iris }) => {
        // QR Code mode is selected by default
        await expect(iris.qrCodeModeButton).toHaveAttribute('aria-expanded', 'true');
        await expect(iris.bankListModeButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('should have proper aria-controls attributes linking to content panels', async ({ iris }) => {
        await expect(iris.qrCodeModeButton).toHaveAttribute('aria-controls');
        await expect(iris.bankListModeButton).toHaveAttribute('aria-controls');
    });

    test('should update aria-expanded when switching between modes', async ({ iris }) => {
        // Initial state: QR Code selected
        await expect(iris.qrCodeModeButton).toHaveAttribute('aria-expanded', 'true');
        await expect(iris.bankListModeButton).toHaveAttribute('aria-expanded', 'false');

        // Switch to Bank List mode
        await iris.switchToBankListMode();

        // Verify aria-expanded is updated
        await expect(iris.qrCodeModeButton).toHaveAttribute('aria-expanded', 'false');
        await expect(iris.bankListModeButton).toHaveAttribute('aria-expanded', 'true');

        // Switch back to QR Code mode
        await iris.switchToQrCodeMode();

        // Verify aria-expanded is updated again
        await expect(iris.qrCodeModeButton).toHaveAttribute('aria-expanded', 'true');
        await expect(iris.bankListModeButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('should be keyboard navigable between segmented control options', async ({ page, iris }) => {
        // Focus on the QR Code button
        await iris.qrCodeModeButton.focus();
        await expect(iris.qrCodeModeButton).toBeFocused();

        // Tab to Bank List button
        await page.keyboard.press('Tab');
        await expect(iris.bankListModeButton).toBeFocused();

        // Press Enter to activate Bank List mode
        await page.keyboard.press('Enter');

        // Verify Bank List mode is now selected
        expect(await iris.isBankListModeSelected()).toBe(true);
        await expect(iris.bankListModeButton).toHaveAttribute('aria-expanded', 'true');
    });

});
