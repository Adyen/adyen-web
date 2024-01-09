import { Locator, Page } from '@playwright/test';
import { CardWithAvs } from '../../models/card-avs';

class CardAvsPage {
    readonly page: Page;

    readonly cardWithAvs: CardWithAvs;
    readonly payButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.cardWithAvs = new CardWithAvs(page);
        this.payButton = page.getByRole('button', { name: /Pay/i });
    }

    async goto(url?: string) {
        await this.page.goto('http://localhost:3024/cards');
    }
}

export { CardAvsPage };
