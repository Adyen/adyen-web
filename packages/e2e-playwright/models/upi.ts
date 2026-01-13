import { Locator, Page } from '@playwright/test';
import { Base } from './base';

class UPI extends Base {
    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly appList: Locator;
    readonly intentArea: Locator;
    readonly qrCodeImage: Locator;

    constructor(
        public readonly page: Page,
        rootElementSelector: string = '.component-wrapper'
    ) {
        super(page);
        this.rootElement = this.page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        this.appList = this.page.getByRole('radiogroup');
        this.intentArea = this.page.locator('#upi-area-intent');
        this.qrCodeImage = this.page.getByAltText('Scan QR code');
    }

    async selectApp(appName: string | RegExp) {
        await this.page.getByRole('radio', { name: appName }).click();
    }

    async isQrCodeVisible() {
        await this.page.locator('.adyen-checkout__qr-loader').waitFor({ state: 'visible' });
    }
}

export { UPI };
