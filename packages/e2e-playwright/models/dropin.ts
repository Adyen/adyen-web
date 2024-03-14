import { Locator, Page } from '@playwright/test';
import { USER_TYPE_DELAY } from '../tests/utils/constants';

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

        this.pmList = this.rootElement.locator('.adyen-checkout__payment-methods-list').last();
    }

    async isComponentVisible() {
        await this.pmList.waitFor({ state: 'visible' });
    }

    getPaymentMethodItem(pmName: string) {
        return this.pmList.locator(`.adyen-checkout__payment-method:has-text("${pmName}")`);
    }

    async typeIntoSecuredField(pm, iframeTitle, iframeInputLabel, text) {
        const sfIframe = pm.frameLocator(`[title="${iframeTitle}"]`);
        const sfInput = sfIframe.locator(`input[aria-label="${iframeInputLabel}"]`);

        await sfInput.type(text, { delay: USER_TYPE_DELAY });
    }
}

export { Dropin };
