import { test as base, expect } from './base-fixture';
import { Card } from '../models/card';
import { BCMC } from '../models/bcmc';
import { URL_MAP } from './URL_MAP';
import { CardWithAvs } from '../models/card-avs';
import { CardWithKCP } from '../models/card-kcp';
import { CardWithSSN } from '../models/card-ssn';

type Fixture = {
    card: Card;
    cardWithAvs: CardWithAvs;
    cardWithKCP: CardWithKCP;
    cardWithSSN: CardWithSSN;
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
    cardWithKCP: async ({ page }, use) => {
        const cardPage = new CardWithKCP(page);
        await use(cardPage);
    },
    cardWithSSN: async ({ page }, use) => {
        const cardPage = new CardWithSSN(page);
        await use(cardPage);
    },
    bcmc: async ({ page }, use) => {
        const bcmc = new BCMC(page);
        await use(bcmc);
    }
});

export { test, expect };
