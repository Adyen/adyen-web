import { test as base, expect } from '@playwright/test';
import { AmazonPayPage } from './amazonPay.page';

type Fixture = {
    amazonPayPage: AmazonPayPage;
};

const test = base.extend<Fixture>({
    amazonPayPage: async ({ page }, use) => {
        const amazonPay = new AmazonPayPage(page);

        await amazonPay.goto();
        await use(amazonPay);
    }
});

export { test, expect };
