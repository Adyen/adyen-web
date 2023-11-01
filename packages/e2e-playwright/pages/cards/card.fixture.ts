import { test as base, expect } from '@playwright/test';
import { CardPage } from './card.page';
import { CardAvsPage } from './card.avs.page';

type Fixture = {
    cardPage: CardPage;
    cardAvsPage: CardAvsPage;
    cardNoContextualElementPage: CardPage;
    cardLegacyInputModePage: CardPage;
    cardBrandingPage: CardPage;
    cardExpiryDatePoliciesPage: CardPage;
    cardInstallmentsPage: CardPage;
};

const test = base.extend<Fixture>({
    cardPage: async ({ page }, use) => {
        await useCardPage(page, use);
    },

    cardAvsPage: async ({ page }, use) => {
        // TODO: to be replaced with a proper page loading Card with AVS inside Storybook
        await page.addInitScript({
            content:
                "window.cardConfig = { billingAddressRequired: true, billingAddressRequiredFields: ['street', 'houseNumberOrName', 'postalCode', 'city']};"
        });

        // @ts-ignore
        await useCardPage(page, use, CardAvsPage);
    },

    cardNoContextualElementPage: async ({ page }, use) => {
        await page.addInitScript({
            content: 'window.cardConfig = { showContextualElement: false }'
        });

        await useCardPage(page, use);
    },

    cardLegacyInputModePage: async ({ page }, use) => {
        await page.addInitScript({
            content: 'window.cardConfig = { legacyInputMode: true}'
        });

        await useCardPage(page, use);
    },

    cardBrandingPage: async ({ page }, use) => {
        const brands = JSON.stringify({ brands: ['mc', 'visa', 'amex', 'maestro', 'bcmc'] });
        await page.addInitScript({
            content: `window.cardConfig = ${brands}`
        });

        await useCardPage(page, use);
    },

    cardExpiryDatePoliciesPage: async ({ page }, use) => {
        const mainConfig = JSON.stringify({
            srConfig: {
                moveFocus: false
            }
        });
        await page.addInitScript({
            content: `window.mainConfiguration = ${mainConfig}`
        });

        const brands = JSON.stringify({ brands: ['mc', 'visa', 'amex', 'synchrony_plcc'] });
        await page.addInitScript({
            content: `window.cardConfig = ${brands}`
        });

        await useCardPage(page, use);
    },

    cardInstallmentsPage: async ({ page }, use) => {
        const installmentsConfig = JSON.stringify({
            installmentOptions: {
                mc: {
                    values: [1, 2, 3],
                    plans: ['regular', 'revolving']
                }
            }
        });
        await page.addInitScript({
            content: `window.cardConfig = ${installmentsConfig}`
        });

        await useCardPage(page, use);
    }
});

const useCardPage = async (page, use, PageType = CardPage) => {
    const cardPage = new PageType(page);
    await cardPage.goto();
    await use(cardPage);
};

export { test, expect };
