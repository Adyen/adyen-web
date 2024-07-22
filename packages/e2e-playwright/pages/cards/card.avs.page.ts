import { Locator, Page } from '@playwright/test';
import { CardWithAvs } from '../../models/card-avs';
import { Result } from '../../models/result';

class CardAvsPage {
    static readonly avsContainerSelector = '.card-avs-partial-field';
    readonly page: Page;

    readonly cardWithAvs: CardWithAvs;
    readonly payButton: Locator;
    readonly paymentResult: Locator;

    constructor(page: Page) {
        this.page = page;
        this.cardWithAvs = new CardWithAvs(page, CardAvsPage.avsContainerSelector);
        this.payButton = page.locator(CardAvsPage.avsContainerSelector).getByRole('button', { name: /Pay/i });
        //this.paymentResult = new Result(page).paymentResult;
    }

    async goto(url?: string) {
        await this.page.goto('http://localhost:3020/cards', { timeout: 60000 });
    }
}

export { CardAvsPage };
