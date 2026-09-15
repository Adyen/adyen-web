import { Locator, Page } from '@playwright/test';
import { Base } from './base';
import { Card } from './card';
import { EMIPlanSelection } from './emiPlanSelection';
import { ThreeDs2Challenge } from './threeds2Challenge';

class EMI extends Base {
    readonly card: Card;
    readonly planSelection: EMIPlanSelection;
    readonly errorFields: Locator;
    readonly threeDs2Challenge: ThreeDs2Challenge;
    readonly payButton: Locator;

    constructor(public readonly page: Page) {
        super(page);
        this.card = new Card(page);
        this.planSelection = new EMIPlanSelection(page);
        this.errorFields = this.page.locator('.adyen-checkout__field--error');
        this.threeDs2Challenge = this.card.threeDs2Challenge;
        // The plan summary carries every figure, so the EMI button is labelled 'Pay' without an amount
        this.payButton = this.page.getByRole('button', { name: 'Pay', exact: true });
    }

    get cardNumberField(): Locator {
        return this.card.cardNumberField;
    }

    get holderNameField(): Locator {
        return this.card.holderNameField;
    }

    /** The pay button is optional (`showPayButton`), so readiness is the embedded card form */
    async isComponentVisible() {
        await this.card.isCardFormVisible();
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
