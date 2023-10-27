import { test as base, expect } from '@playwright/test';
import { CustomCardPage } from './customCard.page';
import { CustomCardPageSeparate } from './customCardSeparate.page';

type Fixture = {
    customCardPage: CustomCardPage;
    customCardPageSeparate: CustomCardPageSeparate;
};

const test = base.extend<Fixture>({
    customCardPage: async ({ page }, use) => {
        const cardPage = new CustomCardPage(page);
        await cardPage.goto();
        await use(cardPage);
    },

    customCardPageSeparate: async ({ page }, use) => {
        const cardPage = new CustomCardPageSeparate(page);
        await cardPage.goto();
        await use(cardPage);
    }
});

export { test, expect };
