import { test as base, expect, Page } from '@playwright/test';
import { CardPage } from './card.page';
import { CardAvsPage } from './card.avs.page';
import { URL_MAP } from './URL_MAP';

type Fixture = {
    cardPage: CardPage;
    cardAvsPage: CardAvsPage;
    cardPartialAvsPage: CardAvsPage;
    /* todo: UI test
    cardNoContextualElementPage: CardPage;
    cardLegacyInputModePage: CardPage;
    cardBrandingPage: CardPage;
    cardExpiryDatePoliciesPage: CardPage;*/
    cardInstallmentsPage: CardPage;
    cardKcpPage: CardPage;
    cardClickToPayPage: CardPage;
    //cardInstallmentsFullWidthPage: CardPage; -> to be checked
};

const test = base.extend<Fixture>({
    cardPage: async ({ page }, use) => {
        await useCardPage({ page, use, PageType: CardPage });
    },

    cardAvsPage: async ({ page }, use) => {
        await useCardPage({ page, use, PageType: CardAvsPage });
    },

    cardPartialAvsPage: async ({ page }, use) => {
        await useCardPage({ page, use, PageType: CardAvsPage, url: URL_MAP.cardWithPartialAvs });
    },

    cardInstallmentsPage: async ({ page }, use) => {
        await useCardPage({ page, use, PageType: CardPage, url: URL_MAP.cardWithInstallments });
    },

    cardKcpPage: async ({ page }, use) => {
        await useCardPage({ page, use, PageType: CardPage, url: URL_MAP.cardWithKcp });
    },

    cardClickToPayPage: async ({ page }, use) => {
        await useCardPage({ page, use, PageType: CardPage, url: URL_MAP.cardWithClickToPay });
    }
});

const useCardPage = async ({ page, use, PageType, url = null }) => {
    const cardPage = new PageType(page);
    await cardPage.goto(url);
    await use(cardPage);
};

export { test, expect };
