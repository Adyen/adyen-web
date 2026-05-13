import { Locator, Page } from '@playwright/test';
import { IssuerList } from './issuer-list';

/**
 * Iris extends IssuerList with segmented control for QR Code / Bank List modes
 */
class Iris extends IssuerList {
    // Segmented control tabs
    readonly qrCodeModeTab: Locator;
    readonly bankListModeTab: Locator;
    readonly segmentedControlGroup: Locator;

    // QR Code mode elements
    readonly generateQrCodeButton: Locator;
    readonly qrCodeImage: Locator;

    // Status elements
    readonly successMessage: Locator;

    constructor(page: Page, rootElementSelector: string = '.adyen-checkout__issuer-list') {
        super(page, rootElementSelector);

        // Segmented control (outside of .adyen-checkout__issuer-list, so use page-level locator)
        this.segmentedControlGroup = page.locator('.adyen-checkout__segmented-control');
        this.qrCodeModeTab = this.segmentedControlGroup.getByRole('tab', { name: 'QR code' });
        this.bankListModeTab = this.segmentedControlGroup.getByRole('tab', { name: 'Bank list' });

        // QR Code mode (QR elements are in a separate panel, not inside .adyen-checkout__issuer-list)
        this.generateQrCodeButton = page.getByRole('button', { name: 'Generate QR code' });
        this.qrCodeImage = page.getByAltText('Scan QR code');

        // Status
        this.successMessage = page.locator('.adyen-checkout__status--success');
    }

    get generateQrCodeContainer(): Locator {
        return this.page.getByTestId('iris-generate-qr-code');
    }

    get qrCodeContainer(): Locator {
        return this.page.getByTestId('iris-qr-loader');
    }

    async switchToQrCodeMode() {
        await this.qrCodeModeTab.click();
    }

    async switchToBankListMode() {
        await this.bankListModeTab.click();
    }

    async isQrCodeModeSelected(): Promise<boolean> {
        const ariaSelected = await this.qrCodeModeTab.getAttribute('aria-selected');
        return ariaSelected === 'true';
    }

    async isBankListModeSelected(): Promise<boolean> {
        const ariaSelected = await this.bankListModeTab.getAttribute('aria-selected');
        return ariaSelected === 'true';
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
