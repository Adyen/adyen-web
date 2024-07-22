import { Locator, Page } from '@playwright/test';
import { USER_TYPE_DELAY } from '../tests/utils/constants';

class Address {
    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly countrySelector: Locator;
    readonly streetInput: Locator;
    readonly houseNumberInput: Locator;
    readonly postalCodeInput: Locator;
    readonly cityInput: Locator;

    constructor(page: Page, rootElementSelector: string = '.adyen-checkout__fieldset--billingAddress') {
        this.rootElement = page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        this.countrySelector = this.rootElement.getByRole('combobox', { name: /country\/region/i });
        this.streetInput = this.rootElement.getByRole('textbox', { name: /street/i });
        this.houseNumberInput = this.rootElement.getByRole('textbox', { name: /house number/i });
        this.postalCodeInput = this.rootElement.getByRole('textbox', { exact: false, name: /code/i }); // US uses 'Zip Code', the rest uses 'Postal Code'
        this.cityInput = this.rootElement.getByRole('textbox', { name: /city/i });
    }

    async fillInPostCode(postCode: string) {
        await this.postalCodeInput.fill(postCode);
    }
}

export { Address };
