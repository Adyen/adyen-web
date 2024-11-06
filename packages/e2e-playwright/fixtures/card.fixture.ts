import { test as base, expect } from '@playwright/test';
import { Card } from '../models/card';
import { BCMC } from '../models/bcmc';
import { URL_MAP } from './URL_MAP';
import { CardWithAvs } from '../models/card-avs';

type Fixture = {
    card: Card;
    cardWithAvs: CardWithAvs;
    bcmc: BCMC;
};

const test = base.extend<Fixture>({
    card: async ({ page }, use) => {
        const cardPage = new Card(page);
        await use(cardPage);
    },
    cardWithAvs: async ({ page }, use) => {
        const cardPage = new CardWithAvs(page);
        await use(cardPage);
    },
    bcmc: async ({ page }, use) => {
        const bcmc = new BCMC(page);
        await bcmc.goto(URL_MAP.bcmc);
        await use(bcmc);
    }
});

export { test, expect };
