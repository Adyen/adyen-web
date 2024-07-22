import { Locator, Page } from '@playwright/test';
import { Card } from '../../models/card';

class CardPage {
    readonly card: Card;
    readonly payButton: Locator;

    constructor(public readonly page: Page) {
        this.card = new Card(this.page);
        this.payButton = this.page.getByRole('button', { name: /Pay/i });
    }

    async goto(url?: string) {
        await this.page.goto('http://localhost:3024/cards');
    }

    async pay() {
        await this.payButton.click();
    }
}

export { CardPage };
