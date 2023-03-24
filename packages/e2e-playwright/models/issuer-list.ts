import { Locator, Page } from '@playwright/test';

class IssuerList {
    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly selectorList: Locator;
    readonly selectorCombobox: Locator;
    readonly submitButton: Locator;
    readonly highlightedIssuerButtonGroup: Locator;

    constructor(page: Page, rootElementSelector: string = '.adyen-checkout__issuer-list') {
        this.rootElement = page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        this.selectorList = this.rootElement.getByRole('listbox');
        this.selectorCombobox = this.rootElement.getByRole('combobox');
        this.submitButton = this.rootElement.getByRole('button', { name: /Continue/i });
        this.highlightedIssuerButtonGroup = this.rootElement.getByRole('group');
    }

    async selectIssuerOnSelectorDropdown(issuerName: string) {
        await this.selectorCombobox.click();
        const option = this.selectorList.getByRole('option').getByText(issuerName, { exact: true });
        await option.click();
    }

    async selectHighlightedIssuer(issuerName: string) {
        await this.highlightedIssuerButtonGroup.getByRole('button', { name: issuerName }).click();
    }

    async typeToFilterTerm(filter: string) {
        await this.selectorCombobox.focus();
        await this.selectorCombobox.type(filter);
    }

    async pressKeyboardToNextItem() {
        await this.selectorCombobox.press('ArrowDown');
    }

    async pressKeyboardToPreviousItem() {
        await this.selectorCombobox.press('ArrowDown');
    }

    async pressKeyboardToSelectItem() {
        await this.selectorCombobox.press('Enter');
    }
}

export { IssuerList };
