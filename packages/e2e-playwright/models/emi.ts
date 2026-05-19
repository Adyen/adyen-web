import { Locator, Page } from '@playwright/test';
import { Base } from './base';

class EMI extends Base {
    readonly cardNumberField: Locator;
    readonly holderNameField: Locator;
    readonly errorFields: Locator;

    constructor(public readonly page: Page) {
        super(page);
        this.cardNumberField = this.page.locator('.adyen-checkout__card__cardNumber__input, [data-cse="encryptedCardNumber"]').first();
        this.holderNameField = this.page.locator('.adyen-checkout__card__holderName__input').first();
        this.errorFields = this.page.locator('.adyen-checkout__field--error');

    }
}

export { EMI };
