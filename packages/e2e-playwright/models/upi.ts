import { Locator, Page } from '@playwright/test';
import { Base } from './base';

class UPI extends Base {
    readonly appList: Locator;
    readonly intentArea: Locator;
    readonly qrCodeImage: Locator;
    readonly mandateInfo: Locator;

    constructor(public readonly page: Page) {
        super(page);

        this.appList = this.page.getByRole('radiogroup');
        this.intentArea = this.page.locator('#upi-area-intent');
        this.qrCodeImage = this.page.getByAltText('Scan QR code');
        this.mandateInfo = this.page.locator('.adyen-checkout__alert-message--info');
    }

    async selectApp(appName: string | RegExp) {
        await this.page.getByRole('radio', { name: appName }).click();
    }

    async isQrCodeVisible() {
        await this.page.locator('.adyen-checkout__qr-loader').waitFor({ state: 'visible' });
    }
}

export { UPI };
