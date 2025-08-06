import type { Page, Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export abstract class Base {
    readonly payButton: Locator;

    protected constructor(public readonly page: Page) {}

    get paymentResult() {
        return this.page.locator('.adyen-checkout__status');
    }

    async goto(url: string) {
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
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

    protected a11yComponentSelector() {
        return '#component-root';
    }

    async getA11yErrors(knownViolations = []) {
        const results = await new AxeBuilder({ page: this.page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .disableRules(knownViolations)
            // only check from component root down
            .include(this.a11yComponentSelector())
            .analyze();
        return results.violations;
    }
}
