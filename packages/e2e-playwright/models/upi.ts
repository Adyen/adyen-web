import { Locator, Page } from '@playwright/test';
import { Base } from './base';

class UPI extends Base {
    readonly appList: Locator;
    readonly intentArea: Locator;
    readonly qrCodeImage: Locator;
    readonly appDropdown: Locator;
    readonly errorAlert: Locator;
    readonly qrCodeIntent: Locator;

    constructor(
        public readonly page: Page,
    ) {
        super(page);

        this.appList = this.page.getByRole('radiogroup');
        this.qrCodeIntent = this.page.locator('#upi-area-qr-code');
        this.intentArea = this.page.locator('#upi-area-intent');
        this.qrCodeImage = this.page.getByAltText('Scan QR code');
        this.appDropdown = this.page.getByRole('combobox', { name: /UPI apps/i });
        this.errorAlert = this.page.getByRole('alert');
    }

    async selectApp(appName: string | RegExp) {
        await this.page.getByRole('radio', { name: appName }).click();
    }

    async selectAppFromDropdown(appName: string | RegExp) {
        await this.appDropdown.click();
        await this.page.getByRole('option', { name: appName })
            .first()
            .click();
    }

    async isQrCodeVisible() {
        await this.page.locator('.adyen-checkout__qr-loader').waitFor({ state: 'visible' });
    }
}

export { UPI };
