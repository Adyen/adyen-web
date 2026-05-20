import { Locator, Page } from '@playwright/test';
import { Base } from './base';
import { Card } from './card';
import { ThreeDs2Challenge } from './threeds2Challenge';

class EMI extends Base {
    readonly card: Card;
    readonly errorFields: Locator;
    readonly threeDs2Challenge: ThreeDs2Challenge;

    constructor(public readonly page: Page) {
        super(page);
        this.card = new Card(page);
        this.errorFields = this.page.locator('.adyen-checkout__field--error');
        this.threeDs2Challenge = this.card.threeDs2Challenge;
    }

    get cardNumberField(): Locator {
        return this.card.cardNumberField;
    }

    get holderNameField(): Locator {
        return this.card.holderNameField;
    }

    async isComponentVisible() {
        await this.card.isComponentVisible();
    }

    async typeCardNumber(cardNumber: string) {
        await this.card.typeCardNumber(cardNumber);
    }

    async typeExpiryDate(expiryDate: string) {
        await this.card.typeExpiryDate(expiryDate);
    }

    async typeCvc(cvc: string) {
        await this.card.typeCvc(cvc);
    }
}

export { EMI };
