import { Locator, Page } from '@playwright/test';
import { Card } from '../../models/card';

class CustomCardPage {
    readonly page: Page;

    readonly card: Card;
    readonly payButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.card = new Card(page, '.secured-fields');
        this.payButton = page.getByRole('button', { name: /Pay/i });
    }

    async goto(url?: string) {
        await this.page.goto('http://localhost:3024/customcards');
    }

    async pay() {
        await this.payButton.click();
    }
}

export { CustomCardPage };
