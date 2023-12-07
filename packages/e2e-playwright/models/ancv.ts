import { Locator, Page } from '@playwright/test';
import { USER_TYPE_DELAY } from '../tests/utils/constants';

const SELECTOR_DELAY = 300;

class ANCV {
    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly ancvInput: Locator;
    readonly submitButton: Locator;

    readonly awaitText: Locator;

    readonly page: Page;

    constructor(page: Page, rootElementSelector = '.ancv-field') {
        this.page = page;
        this.rootElement = page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        this.ancvInput = this.rootElement.getByRole('textbox');
        this.submitButton = this.page.getByRole('button', { name: /Confirm purchase/i });

        this.awaitText = this.rootElement.getByText('Use your ANCV application to confirm the payment.');
    }

    async clickOnInput() {
        await this.ancvInput.click({ delay: SELECTOR_DELAY });
    }

    async fillInID(mockId: string) {
        await this.clickOnInput();
        await this.ancvInput.type(mockId, { delay: USER_TYPE_DELAY });
    }

    async clickOnSubmit() {
        await this.submitButton.click({ delay: SELECTOR_DELAY });
    }
}

export { ANCV };
