import { Base } from './base';
import { Locator, Page } from '@playwright/test';

class Ach extends Base {
    private readonly rootElementSelector = '.adyen-checkout__ach';
    private readonly rootElement: Locator;

    constructor(page: Page) {
        super(page);
        this.rootElement = page.locator(this.rootElementSelector);
    }

    get paymentResult() {
        return this.page.locator('.adyen-checkout__status');
    }

    async payWithStoredCard(lastFour: string): Promise<void> {
        const regex = new RegExp(`^continue to.*${lastFour}$`, 'i');
        await super.pay({ name: regex });
    }
}

export default Ach;
