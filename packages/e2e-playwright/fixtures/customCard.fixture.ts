import { test as base, expect } from './base-fixture';
import { URL_MAP } from './URL_MAP';
import { CustomCard } from '../models/customCard';
import { CustomCardSeparateExpiryDate } from '../models/customCardSeparateExpiryDate';

type Fixture = {
    customCard: CustomCard;
    customCardSeparateExpiryDate: CustomCardSeparateExpiryDate;
};

const test = base.extend<Fixture>({
    customCard: async ({ page }, use) => {
        const cardPage = new CustomCard(page);
        await cardPage.goto(URL_MAP.customCard);
        await use(cardPage);
    },

    customCardSeparateExpiryDate: async ({ page }, use) => {
        const cardPage = new CustomCardSeparateExpiryDate(page);
        await cardPage.goto(URL_MAP.customCardSeparateExpiryDate);
        await use(cardPage);
    }
});

export { test, expect };
