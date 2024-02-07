import { Locator, Page } from '@playwright/test';

class AmazonPay {
    readonly page: Page;

    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    constructor(page: Page, rootElementSelector = '.amazonPay-field') {
        this.page = page;
        this.rootElement = page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;
    }
    //
    // async clickOnInput() {
    //     await this.ancvInput.click({ delay: SELECTOR_DELAY });
    // }
    //
    // async fillInID(mockId: string) {
    //     await this.clickOnInput();
    //     await this.ancvInput.type(mockId, { delay: USER_TYPE_DELAY });
    // }
    //
    // async clickOnSubmit() {
    //     await this.submitButton.click({ delay: SELECTOR_DELAY });
    // }
}

export { AmazonPay };
