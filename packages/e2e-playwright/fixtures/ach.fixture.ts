import { test as base, expect } from '@playwright/test';
import Ach from '../models/ach';

type Fixture = {
    ach: Ach;
};

const test = base.extend<Fixture>({
    ach: async ({ page }, use) => {
        await use(new Ach(page));
    }
});

export { test, expect };
