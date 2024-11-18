import { Card } from './card';
import { type Locator, Page } from '@playwright/test';

class CardWithSSN extends Card {
    readonly ssnField: Locator;

    constructor(page: Page) {
        super(page);
        this.ssnField = this.rootElement.locator('.adyen-checkout__field--socialSecurityNumber'); // Holder
    }

    get ssnInput() {
        return this.ssnField.getByRole('textbox', { name: /CPF\/CNPJ/i });
    }
}

export { CardWithSSN };
