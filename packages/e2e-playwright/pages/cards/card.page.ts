import { Locator, Page } from '@playwright/test';
import { Card } from '../../models/card';
import { URL_MAP } from './URL_MAP';

class CardPage {
    static readonly URL = URL_MAP.card;
    readonly card: Card;
    readonly payButton: Locator;

    constructor(public readonly page: Page) {
        this.card = new Card(this.page);
        this.payButton = this.page.getByRole('button', { name: /Pay/i });
    }

    async goto(url: string = CardPage.URL) {
        await this.page.goto(url);
    }

    async pay() {
        await this.payButton.click();
    }
}

export { CardPage };
