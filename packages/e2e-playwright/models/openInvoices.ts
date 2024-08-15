import { Locator, Page } from '@playwright/test';
import { Base } from './base';

class OpenInvoices extends Base {
    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly riverty: Locator;
    readonly rivertyDeliveryAddressCheckbox: Locator;

    constructor(
        public readonly page: Page,
        rootElementSelector = '#component-root'
    ) {
        super(page);
        this.rootElement = this.page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        this.riverty = this.rootElement.locator('.adyen-checkout__open-invoice');

        this.rivertyDeliveryAddressCheckbox = this.riverty
            .locator('.adyen-checkout__checkbox')
            .filter({ hasText: 'Specify a separate delivery address' });
    }

    async isComponentVisible() {
        await this.riverty.waitFor({ state: 'visible' });
    }

    async pay(options: { name?: RegExp } = { name: /confirm purchase/i }): Promise<void> {
        await super.pay(options);
    }
}

export { OpenInvoices };
