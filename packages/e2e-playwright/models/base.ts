import type { Page } from '@playwright/test';

export abstract class Base {
    protected constructor(public readonly page: Page) {}

    get paymentResult() {
        return this.page.getByTestId('result-message').textContent();
    }

    async goto(url: string) {
        await this.page.goto(url);
        await this.isComponentVisible();
    }

    async pay(options: { name?: RegExp } = { name: /Pay/i }): Promise<void> {
        await this.page.getByRole('button', options).click();
    }

    async isComponentVisible() {
        await Promise.resolve();
    }
}
