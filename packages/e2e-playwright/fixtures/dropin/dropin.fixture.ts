import { test as base, expect, mergeTests } from '@playwright/test';
import { test as card } from '../cards/card.fixture';
import { DropinWithSession } from '../../models/dropinWithSession';
import { Dropin } from '../../models/dropin';

type Fixture = {
    dropinPage: Dropin;
    dropinPageWithSession: DropinWithSession;
};

const test = base.extend<Fixture>({
    dropinPage: async ({ page }, use) => {
        const dropin = new Dropin(page);
        await use(dropin);
    },
    dropinPageWithSession: async ({ page }, use) => {
        const dropin = new DropinWithSession(page);
        await use(dropin);
    }
});

const testCardInDropin = mergeTests(card, test);

export { test, expect, testCardInDropin };
