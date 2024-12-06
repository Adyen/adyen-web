import type { Page, Locator } from '@playwright/test';

export abstract class Base {
    readonly payButton: Locator;

    protected constructor(public readonly page: Page) {}

    get paymentResult() {
        return this.page.locator('.adyen-checkout__status');
    }

    async goto(url: string) {
        await this.page.goto(url);
        await this.isComponentVisible();
    }

    async pay(options: { name?: RegExp | string } = { name: /pay/i }): Promise<void> {
        if (this.payButton) {
            await this.payButton.click();
        } else {
            await this.page.getByRole('button', options).click();
        }
    }

    async isComponentVisible() {
        await Promise.resolve();
    }
}
