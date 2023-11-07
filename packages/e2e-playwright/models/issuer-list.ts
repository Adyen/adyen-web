import { Locator, Page } from '@playwright/test';
import { USER_TYPE_DELAY } from '../tests/utils/constants';

const SELECTOR_DELAY = 300;

class IssuerList {
    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly selectorList: Locator;
    readonly selectorCombobox: Locator;
    readonly submitButton: Locator;
    readonly highlightedIssuerButtonGroup: Locator;

    readonly page: Page;

    constructor(page: Page, rootElementSelector: string = '.adyen-checkout__issuer-list') {
        this.page = page;
        this.rootElement = page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        this.selectorList = this.rootElement.getByRole('listbox');
        this.selectorCombobox = this.rootElement.getByRole('combobox');
        this.submitButton = this.rootElement.getByRole('button', { name: /Continue/i });
        this.highlightedIssuerButtonGroup = this.rootElement.getByRole('group');
    }

    async clickOnSelector() {
        await this.selectorCombobox.click({ delay: SELECTOR_DELAY });
    }

    async selectIssuerOnSelectorDropdown(issuerName: string) {
        await this.clickOnSelector();
        const option = this.selectorList.getByRole('option').getByText(issuerName, { exact: true });
        await option.click();
    }

    async selectHighlightedIssuer(issuerName: string) {
        await this.highlightedIssuerButtonGroup.getByRole('button', { name: issuerName }).click();
    }

    async typeOnSelectorField(filter: string) {
        await this.selectorCombobox.type(filter, { delay: USER_TYPE_DELAY });
    }
}

export { IssuerList };
