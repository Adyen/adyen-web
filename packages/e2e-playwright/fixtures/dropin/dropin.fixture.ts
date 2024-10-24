import { test as base, expect, Page } from '@playwright/test';
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

export { test, expect };
