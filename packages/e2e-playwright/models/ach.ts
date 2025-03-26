import { Base } from './base';
import { Locator, Page } from '@playwright/test';

class Ach extends Base {
    private readonly rootElement: Locator;

    constructor(
        public readonly page: Page,
        public readonly rootElementSelector: Locator | string
    ) {
        super(page);
        const selector = rootElementSelector ?? '.adyen-checkout__ach';
        this.rootElement = typeof selector === 'string' ? this.page.locator(selector) : selector;
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
