import { Locator, Page } from '@playwright/test';

class Address {
    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    constructor(page: Page, rootElementSelector: string = '.adyen-checkout__fieldset--billingAddress') {
        this.rootElement = page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;
    }

    get countrySelector() {
        return this.rootElement.getByRole('combobox', { name: /country\/region/i });
    }

    get streetInput() {
        return this.rootElement.getByRole('textbox', { name: /street/i });
    }

    get houseNumberInput() {
        return this.rootElement.getByRole('textbox', { name: /house number/i });
    }

    get cityInput() {
        return this.rootElement.getByRole('textbox', { name: /city/i });
    }

    get postalCodeInput() {
        return this.rootElement.getByRole('textbox', { exact: false, name: /code/i }); // US uses 'Zip Code', the rest uses 'Postal Code';
    }

    async fillInPostCode(postCode: string) {
        await this.postalCodeInput.fill(postCode);
    }
}

export { Address };
