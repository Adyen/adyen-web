import { Locator, Page } from '@playwright/test';
import { CustomCard } from '../../models/customCard';

class CustomCardPage {
    readonly page: Page;

    readonly card: CustomCard;
    readonly payButtonRegular: Locator;
    readonly payButtonSeparate: Locator;

    constructor(page: Page, selector?) {
        this.page = page;
        this.card = new CustomCard(page, selector);
        this.payButtonRegular = page.getByTestId('pay-customCardRegular');
        this.payButtonSeparate = page.getByTestId('pay-customCardSeparate');
    }

    async goto(url?: string) {
        await this.page.goto('http://localhost:3024/customcards');
    }

    async pay(which: string = 'Regular') {
        await this[`payButton${which}`].scrollIntoViewIfNeeded();
        await this[`payButton${which}`].click();
    }
}

export { CustomCardPage };
