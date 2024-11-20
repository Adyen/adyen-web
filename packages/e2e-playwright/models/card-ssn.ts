import { Card } from './card';
import { type Locator, Page } from '@playwright/test';

class CardWithSSN extends Card {
    readonly ssnField: Locator;

    constructor(page: Page) {
        super(page);
        this.ssnField = this.rootElement.locator('.adyen-checkout__field--socialSecurityNumber');
    }

    get ssnInput() {
        return this.ssnField.getByRole('textbox', { name: /CPF\/CNPJ/i });
    }

    get ssnInputErrorElement() {
        return this.ssnField.getByText('Enter a valid CPF/CNPJ number');
    }

    async typeSsn(ssn: string) {
        await this.ssnInput.fill(ssn);
    }
}

export { CardWithSSN };
