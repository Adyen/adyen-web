import { Locator, Page } from '@playwright/test';
import { DropinPage } from '../pages/dropin/dropin.page';
import { DropinSessionsPage } from '../pages/dropin/dropin.sessions.page';

class Dropin {
    readonly page: Page;
    readonly dropinPage: DropinPage | DropinSessionsPage;

    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly pmList: Locator;
    readonly creditCard: Locator;
    readonly brandsHolder: Locator;

    constructor(page: Page, dropinPage: DropinPage | DropinSessionsPage, rootElementSelector = '.adyen-checkout__dropin') {
        this.page = page;
        this.dropinPage = dropinPage;
        this.rootElement = page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        this.pmList = this.rootElement.locator('.adyen-checkout__payment-methods-list').last();
    }

    async isComponentVisible() {
        await this.pmList.waitFor({ state: 'visible' });
    }

    getPaymentMethodItemByType(pmType: string) {
        // @ts-ignore
        const pmLabel = this.dropinPage.paymentMethods.find((pm: { type: string }) => pm.type === pmType).name;
        return this.pmList.locator(`.adyen-checkout__payment-method:has-text("${pmLabel}")`);
    }
}

export { Dropin };
