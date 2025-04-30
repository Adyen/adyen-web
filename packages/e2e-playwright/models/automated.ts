import type { Page, Locator } from '@playwright/test';
import { Base } from './base';

export class Automated extends Base {
    readonly payButton: Locator;

    constructor(page: Page) {
        super(page);

        this.payButton = this.page.locator('.adyen-checkout__button--pay');
    }

    async goto(url: string) {
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await this.isComponentVisible();
    }

    async isComponentVisible() {
        await this.payButton.waitFor({ state: 'visible' });
    }
}
