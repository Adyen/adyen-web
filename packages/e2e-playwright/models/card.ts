import { Locator, Page } from '@playwright/test';
import { USER_TYPE_DELAY } from '../tests/utils/constants';

class Card {
    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly cardNumberInput: Locator;
    readonly expiryDateInput: Locator;
    readonly cvcInput: Locator;

    constructor(page: Page, rootElementSelector: string = '.adyen-checkout__card-input') {
        this.rootElement = page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        this.cardNumberInput = this.rootElement.frameLocator('[title="Iframe for card number"]').locator('input[aria-label="Card number"]');
        this.expiryDateInput = this.rootElement.frameLocator('[title="Iframe for expiry date"]').locator('input[aria-label="Expiry date"]');
        this.cvcInput = this.rootElement.frameLocator('[title="Iframe for security code"]').locator('input[aria-label="Security code"]');
    }

    async isComponentVisible() {
        await this.cardNumberInput.waitFor({ state: 'visible' });
        await this.expiryDateInput.waitFor({ state: 'visible' });
        await this.cvcInput.waitFor({ state: 'visible' });
    }

    async typeCardNumber(cardNumber: string) {
        await this.cardNumberInput.type(cardNumber, { delay: USER_TYPE_DELAY });
    }

    async typeExpiryDate(expiryDate: string) {
        await this.expiryDateInput.type(expiryDate, { delay: USER_TYPE_DELAY });
    }

    async typeCvc(cvc: string) {
        await this.cvcInput.type(cvc, { delay: USER_TYPE_DELAY });
    }
}

export { Card };
