import { test as base, expect } from '@playwright/test';
import { URL_MAP } from '../URL_MAP';
import { CustomCard } from '../../models/customCard';
import { CustomCardSeparateExpiryDate } from '../../models/customCardSeparateExpiryDate';

type Fixture = {
    customCardPage: CustomCard;
    customCardPageSeparate: CustomCardSeparateExpiryDate;
};

const test = base.extend<Fixture>({
    customCardPage: async ({ page }, use) => {
        const cardPage = new CustomCard(page);
        await cardPage.goto(URL_MAP.customCard);
        await use(cardPage);
    },

    customCardPageSeparate: async ({ page }, use) => {
        const cardPage = new CustomCardSeparateExpiryDate(page);
        await cardPage.goto(URL_MAP.customCardSeparateExpiryDate);
        await use(cardPage);
    }
});

export { test, expect };
