import { Locator, Page } from '@playwright/test';
import { CustomCard } from '../../models/customCard';

class CustomCardPage {
    readonly page: Page;

    readonly card: CustomCard;
    readonly payButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.card = new CustomCard(page, '.secured-fields');
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
