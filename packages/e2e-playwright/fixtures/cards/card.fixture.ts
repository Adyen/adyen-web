import { test as base, expect } from '@playwright/test';
import { Card } from '../../models/card';

type Fixture = {
    cardPage: Card;
};

const test = base.extend<Fixture>({
    cardPage: async ({ page }, use) => {
        const cardPage = new Card(page);
        await use(cardPage);
    }
});

export { test, expect };
