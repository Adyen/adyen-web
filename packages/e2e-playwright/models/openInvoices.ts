import { Locator, Page } from '@playwright/test';

class OpenInvoices {
    readonly page: Page;

    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly riverty: Locator;
    readonly rivertyDeliveryAddressCheckbox: Locator;

    constructor(page: Page, rootElementSelector = '#openInvoicesContainer') {
        this.page = page;

        this.rootElement = page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        this.riverty = this.rootElement.locator('#rivertyContainer');

        this.rivertyDeliveryAddressCheckbox = this.riverty
            .locator('.adyen-checkout__checkbox')
            .filter({ hasText: 'Specify a separate delivery address' });
    }

    async isComponentVisible() {
        await this.rootElement.waitFor({ state: 'visible' });
    }
}

export { OpenInvoices };
