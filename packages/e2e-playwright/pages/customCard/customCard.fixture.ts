import { test as base, expect } from '@playwright/test';
import { CustomCardPage } from './customCard.page';

type Fixture = {
    customCardPage: CustomCardPage;
    customCardPageSeparate: CustomCardPage;
};

const test = base.extend<Fixture>({
    customCardPage: async ({ page }, use) => {
        const cardPage = new CustomCardPage(page);
        await cardPage.goto();
        await use(cardPage);
    },

    customCardPageSeparate: async ({ page }, use) => {
        const cardPage = new CustomCardPage(page, '.secured-fields-2');
        await cardPage.goto();
        await use(cardPage);
    }
});

export { test, expect };
