import { test as base, expect } from '@playwright/test';
import { CardPage } from './card.page';

type Fixture = {
    cardPage: CardPage;
};

const test = base.extend<Fixture>({
    cardPage: async ({ page }, use) => {
        await page.addInitScript({
            content: 'window.cardConfig = { showContextualElement: false}'
        });

        const cardPage = new CardPage(page);
        await cardPage.goto();
        await use(cardPage);
    }
});

export { test, expect };
