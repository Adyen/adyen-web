import { test as base, expect } from '@playwright/test';
import { CustomCardPage } from './customCard.page';

type Fixture = {
    customCardPage: CustomCardPage;
};

const test = base.extend<Fixture>({
    customCardPage: async ({ page }, use) => {
        const cardPage = new CustomCardPage(page);
        await cardPage.goto();
        await use(cardPage);
    }
});

export { test, expect };
