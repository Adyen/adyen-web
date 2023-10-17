import { test as base, expect } from '@playwright/test';
import { CardPage } from './card.page';
import { CardAvsPage } from './card.avs.page';

type Fixture = {
    cardPage: CardPage;
    cardAvsPage: CardAvsPage;
    cardNoContextualElementPage: CardPage;
    cardLegacyInputModePage: CardPage;
};

const test = base.extend<Fixture>({
    cardPage: async ({ page }, use) => {
        const cardPage = new CardPage(page);
        await cardPage.goto();
        await use(cardPage);
    },

    cardAvsPage: async ({ page }, use) => {
        // TODO: to be replaced with a proper page loading Card with AVS inside Storybook
        await page.addInitScript({
            content:
                "window.cardConfig = { billingAddressRequired: true, billingAddressRequiredFields: ['street', 'houseNumberOrName', 'postalCode', 'city']};"
        });

        const cardAvsPage = new CardAvsPage(page);
        await cardAvsPage.goto();
        await use(cardAvsPage);
    },

    cardNoContextualElementPage: async ({ page }, use) => {
        await page.addInitScript({
            content: 'window.cardConfig = { showContextualElement: false }'
        });

        const cardPage = new CardPage(page);
        await cardPage.goto();
        await use(cardPage);
    },

    cardLegacyInputModePage: async ({ page }, use) => {
        await page.addInitScript({
            content: 'window.cardConfig = { legacyInputMode: true}'
        });

        const cardPage = new CardPage(page);
        await cardPage.goto();
        await use(cardPage);
    }
});

export { test, expect };
