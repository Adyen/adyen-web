import { Locator, Page } from '@playwright/test';
import { CardWithAvs } from '../../models/card-avs';
import { Result } from '../../models/result';
import { URL_MAP } from './URL_MAP';

class CardAvsPage {
    static readonly URL = URL_MAP.cardWithAvs;
    static readonly avsContainerSelector = '.card-avs-partial-field';
    readonly page: Page;

    readonly cardWithAvs: CardWithAvs;
    readonly payButton: Locator;
    readonly paymentResult: Locator;

    constructor(page: Page) {
        this.page = page;
        this.cardWithAvs = new CardWithAvs(page, CardAvsPage.avsContainerSelector);
        this.payButton = page.getByRole('button', { name: /Pay/i });
        this.paymentResult = new Result(page).paymentResult;
    }

    async goto(url: string = CardAvsPage.URL) {
        await this.page.goto(url);
    }
}

export { CardAvsPage };
