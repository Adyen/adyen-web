import { test as base, expect } from './base-fixture';
import { EMI } from '../models/emi';

type Fixture = {
    emi: EMI;
};

const test = base.extend<Fixture>({
    emi: async ({ page }, use) => {
        await use(new EMI(page));
    }
});

export { test, expect };
