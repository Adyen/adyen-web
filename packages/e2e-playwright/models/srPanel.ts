import { Locator, Page } from '@playwright/test';

class SRPanel {
    readonly rootElement: Locator;

    constructor(page: Page, rootElementSelector: string = '.adyen-checkout-sr-panel') {
        this.rootElement = page.locator(rootElementSelector);
    }

    get allMessages() {
        return this.rootElement.locator('.adyen-checkout-sr-panel__msg').all();
    }
}

export { SRPanel };
