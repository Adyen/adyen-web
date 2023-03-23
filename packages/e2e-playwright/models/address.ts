import { Locator, Page } from '@playwright/test';

class Address {
    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly countrySelector: Locator;
    readonly addressInput: Locator;
    readonly houseNumberInput: Locator;
    readonly postalCodeInput: Locator;
    readonly cityInput: Locator;

    constructor(page: Page, rootElementSelector: string = '.adyen-checkout__fieldset--billingAddress') {
        this.rootElement = page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        this.countrySelector = this.rootElement.getByLabel('Country');
        this.addressInput = this.rootElement.getByLabel('Street');
        this.houseNumberInput = this.rootElement.getByLabel('House number');
        this.postalCodeInput = this.rootElement.getByLabel('Postal code');
        this.cityInput = this.rootElement.getByLabel('City');
    }
}

export { Address };
