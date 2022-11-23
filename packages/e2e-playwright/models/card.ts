import { Locator, Page } from '@playwright/test';

class Card {
    readonly rootElement: Locator;

    readonly cardNumberInput: Locator;
    readonly expiryDateInput: Locator;
    readonly cvcInput: Locator;

    constructor(page: Page, rootElement: string = '.adyen-checkout__card-input') {
        this.rootElement = page.locator(rootElement);

        this.cardNumberInput = this.rootElement.frameLocator('[title="Iframe for secured card number"]').locator('input[aria-label="Card number"]');
        this.expiryDateInput = this.rootElement
            .frameLocator('[title="Iframe for secured card expiry date"]')
            .locator('input[aria-label="Expiry date"]');
        this.cvcInput = this.rootElement.frameLocator('[title="Iframe for secured card security code"]').locator('input[aria-label="Security code"]');
    }

    async fillCardNumber(cardNumber: string) {
        await this.cardNumberInput.fill(cardNumber);
    }

    async fillExpiryDate(expiryDate: string) {
        await this.expiryDateInput.fill(expiryDate);
    }

    async fillCvcInput(cvc: string) {
        await this.cvcInput.fill(cvc);
    }
}

export { Card };
