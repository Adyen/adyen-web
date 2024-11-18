import { Card } from './card';
import { type Locator, Page } from '@playwright/test';

class CardWithKCP extends Card {
    readonly kcpTaxNumberField: Locator;

    constructor(page: Page) {
        super(page);
        this.kcpTaxNumberField = this.rootElement.locator('.adyen-checkout__field--kcp-taxNumber'); // Holder
    }

    get taxNumberInput() {
        return this.kcpTaxNumberField.getByRole('textbox', { name: /Cardholder birthdate/i });
    }
}

export { CardWithKCP };
