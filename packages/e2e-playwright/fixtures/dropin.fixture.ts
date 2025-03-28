import { test as base, expect } from './base-fixture';
import { DropinWithSession } from '../models/dropinWithSession';
import { Dropin } from '../models/dropin';

type Fixture = {
    dropin: Dropin;
    dropinWithSession: DropinWithSession;
};

const test = base.extend<Fixture>({
    dropin: async ({ page }, use) => {
        const dropin = new Dropin(page);
        await use(dropin);
    },
    dropinWithSession: async ({ page }, use) => {
        const dropin = new DropinWithSession(page);
        await use(dropin);
    }
});

export { test, expect };
