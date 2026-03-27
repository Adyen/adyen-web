import { Locator, Page } from '@playwright/test';
import { Base } from './base';

class UPI extends Base {
    readonly rootElement: Locator;
    readonly appList: Locator;
    readonly intentArea: Locator;
    readonly qrCodeImage: Locator;

    constructor(
        public readonly page: Page,
        public readonly rootElementSelector?: Locator | string
    ) {
        super(page);
        const selector = rootElementSelector ?? 'upi-container';
        this.rootElement = typeof selector === 'string' ? this.page.getByTestId(selector) : selector;

        this.appList = this.rootElement.getByRole('radiogroup');
        this.intentArea = this.rootElement.locator('#upi-area-intent');
        this.qrCodeImage = this.rootElement.getByAltText('Scan QR code');
    }

    async selectApp(appName: string | RegExp) {
        await this.rootElement.getByRole('radio', { name: appName }).click();
    }

    async isQrCodeVisible() {
        await this.rootElement.locator('.adyen-checkout__qr-loader').waitFor({ state: 'visible' });
    }
}

export { UPI };
