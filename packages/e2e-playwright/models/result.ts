import { Locator, Page } from '@playwright/test';

class Result {
    readonly result: Locator;

    constructor(page: Page) {
        this.result = page.getByTestId('result-message');
    }

    get paymentResult() {
        return this.result.textContent();
    }
}

export { Result };
