import { Locator, Page } from '@playwright/test';
import { IssuerList } from './issuer-list';

/**
 * Iris extends IssuerList with segmented control for QR Code / Bank List modes
 */
class Iris extends IssuerList {
    // Segmented control buttons
    readonly qrCodeModeButton: Locator;
    readonly bankListModeButton: Locator;
    readonly segmentedControlGroup: Locator;

    // QR Code mode elements
    readonly generateQrCodeButton: Locator;
    readonly qrCodeImage: Locator;

    // Status elements
    readonly successMessage: Locator;

    constructor(page: Page, rootElementSelector: string = '.adyen-checkout__issuer-list') {
        super(page, rootElementSelector);

        // Segmented control
        this.segmentedControlGroup = this.rootElement.locator('.adyen-checkout__segmented-control');
        this.qrCodeModeButton = this.segmentedControlGroup.getByRole('button', { name: 'QR Code' });
        this.bankListModeButton = this.segmentedControlGroup.getByRole('button', { name: 'Bank List' });

        // QR Code mode
        this.generateQrCodeButton = this.rootElement.getByRole('button', { name: 'Generate QR code' });
        this.qrCodeImage = this.rootElement.locator('.adyen-checkout__qr-code img, .adyen-checkout__qr-code canvas');

        // Status
        this.successMessage = this.rootElement.locator('.adyen-checkout__status--success');
    }

    async switchToQrCodeMode() {
        await this.qrCodeModeButton.click();
    }

    async switchToBankListMode() {
        await this.bankListModeButton.click();
    }

    async isQrCodeModeSelected(): Promise<boolean> {
        const ariaExpanded = await this.qrCodeModeButton.getAttribute('aria-expanded');
        return ariaExpanded === 'true';
    }

    async isBankListModeSelected(): Promise<boolean> {
        const ariaExpanded = await this.bankListModeButton.getAttribute('aria-expanded');
        return ariaExpanded === 'true';
    }

    async generateQrCode() {
        await this.generateQrCodeButton.click();
    }

    async waitForQrCode() {
        await this.qrCodeImage.waitFor({ state: 'visible' });
    }

    async waitForSuccess() {
        await this.successMessage.waitFor({ state: 'visible' });
    }

    async waitForSegmentedControl() {
        await this.segmentedControlGroup.waitFor({ state: 'visible' });
    }
}

export { Iris };
