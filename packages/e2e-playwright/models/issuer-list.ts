import { Locator, Page } from '@playwright/test';

class IssuerList {
    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly selectorList: Locator;
    readonly selectorButton: Locator;
    readonly submitButton: Locator;
    readonly highlightedIssuerButtonGroup: Locator;

    constructor(page: Page, rootElementSelector: string = '.adyen-checkout__issuer-list') {
        this.rootElement = page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        this.selectorList = this.rootElement.getByRole('listbox');
        this.selectorButton = this.rootElement.locator('.adyen-checkout__dropdown__button');
        this.submitButton = this.rootElement.getByRole('button', { name: /Continue/i });
        this.highlightedIssuerButtonGroup = this.rootElement.getByRole('group');
    }

    async selectIssuerOnSelectorDropdown(issuerName: string) {
        await this.selectorButton.click();
        const option = this.selectorList.getByRole('option').getByAltText(issuerName, { exact: true });
        await option.click();
    }

    async selectHighlightedIssuer(issuerName: string) {
        await this.highlightedIssuerButtonGroup.getByRole('button', { name: issuerName }).click();
    }
}

export { IssuerList };
