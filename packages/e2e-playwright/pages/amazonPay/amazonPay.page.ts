import { Page } from '@playwright/test';
import { AmazonPay } from '../../models/amazonPay';

class AmazonPayPage {
    public readonly page: Page;

    public readonly amazonPay: AmazonPay;

    constructor(page: Page) {
        this.page = page;
        this.amazonPay = new AmazonPay(page);
    }

    async goto(url?: string) {
        const gotoUrl = url ? url : 'http://localhost:3020/';
        await this.page.goto(gotoUrl);
    }
}

export { AmazonPayPage };
