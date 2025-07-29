import type { Page, Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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

    async isPayable() {
        await this.page.waitForFunction(() => globalThis.component.isValid === true);
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

    async getA11yErrors() {
        const results = await new AxeBuilder({ page: this.page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            // only check from component root down
            .include('#component-root')
            .analyze();
        return results;
    }
}
