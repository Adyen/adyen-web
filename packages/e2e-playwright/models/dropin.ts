import { Locator, Page } from '@playwright/test';

class Dropin {
    readonly page: Page;

    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly pmList: Locator;
    readonly creditCard: Locator;
    readonly brandsHolder: Locator;

    constructor(page: Page, rootElementSelector = '.adyen-checkout__dropin') {
        this.page = page;

        this.rootElement = page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        this.pmList = this.rootElement.locator('.adyen-checkout__payment-methods-list');
    }

    async isComponentVisible() {
        await this.pmList.waitFor({ state: 'visible' });
    }

    getPaymentMethodItem(pmName: string) {
        return this.pmList.locator(`.adyen-checkout__payment-method:has-text("${pmName}")`);
    }
}

export { Dropin };
