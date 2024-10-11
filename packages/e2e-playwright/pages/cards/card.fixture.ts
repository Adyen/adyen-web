import { test as base, expect } from '@playwright/test';
import { Card } from '../../models/card';
import { CardWithAvs } from '../../models/card-avs';

type Fixture = {
    cardPage: Card;
    cardAvsPage: CardWithAvs;
};

const test = base.extend<Fixture>({
    cardPage: async ({ page }, use) => {
        const cardPage = new Card(page);
        await use(cardPage);
    },
    cardAvsPage: async ({ page }, use) => {
        const cardPage = new CardWithAvs(page);
        await use(cardPage);
    }
});

export { test, expect };
