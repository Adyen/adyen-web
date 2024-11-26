import { Locator, Page } from '@playwright/test';

class Address {
    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    constructor(
        public readonly page: Page,
        rootElementSelector: string = '.adyen-checkout__fieldset--billingAddress'
    ) {
        this.rootElement = page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;
    }

    get countrySelector() {
        return this.rootElement.getByRole('combobox', { name: /country\/region/i });
    }

    get stateError() {
        return this.rootElement.locator('.adyen-checkout__field--stateOrProvince').locator('.adyen-checkout-contextual-text--error');
    }

    get streetInput() {
        return this.rootElement.getByRole('textbox', { name: /\b(address|street)\b/i });
    }

    get streetInputError() {
        return this.rootElement.locator('.adyen-checkout__field--street').locator('.adyen-checkout-contextual-text--error');
    }

    get houseNumberInput() {
        return this.rootElement.getByRole('textbox', { name: /house number/i });
    }

    get cityInput() {
        return this.rootElement.getByRole('textbox', { name: /city/i });
    }

    get cityError() {
        return this.rootElement.locator('.adyen-checkout__field--city').locator('.adyen-checkout-contextual-text--error');
    }

    get postalCodeInput() {
        return this.rootElement.getByRole('textbox', { exact: false, name: /code/i }); // US uses 'Zip Code', the rest uses 'Postal Code';
    }

    get postalCodeError() {
        return this.rootElement.locator('.adyen-checkout__field--postalCode').locator('.adyen-checkout-contextual-text--error');
    }

    get stateInput() {
        return this.rootElement.getByRole('combobox', { name: /state/i });
    }

    get addressSearchInput() {
        return this.rootElement.getByRole('combobox', { name: /address/i });
    }

    async fillInPostCode(postCode: string) {
        await this.postalCodeInput.waitFor({ state: 'visible' });
        await this.postalCodeInput.fill(postCode);
    }

    async selectState(options: { name?: RegExp | string }) {
        await this.stateInput.waitFor({ state: 'visible' });
        await this.stateInput.click();
        await this.rootElement.getByRole('option', options).click();
    }

    async selectCountry(options: { name?: RegExp | string }) {
        await this.countrySelector.click();
        await this.rootElement.getByRole('option', options).click();
    }

    async fillInStreet(street: string) {
        await this.streetInput.waitFor({ state: 'visible' });
        await this.streetInput.fill(street);
    }

    async fillInHouseNumber(houseNumber: string) {
        await this.houseNumberInput.fill(houseNumber);
    }

    async fillInCity(city: string) {
        await this.cityInput.waitFor({ state: 'visible' });
        await this.cityInput.fill(city);
    }

    async searchAddressAndChooseTheFirst(query: string) {
        await this.addressSearchInput.click();
        await this.addressSearchInput.fill(query);
        await this.rootElement
            .getByRole('option', { name: new RegExp(query, 'i') })
            .first()
            .click();
    }
}

export { Address };
