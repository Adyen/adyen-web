import { test as base, expect } from '@playwright/test';
import { DropinPage } from './dropin.page';

type Fixture = {
    dropinPage: DropinPage;
};

const test = base.extend<Fixture>({
    dropinPage: async ({ page }, use) => {
        const dropinPage = new DropinPage(page);
        await dropinPage.goto();
        await use(dropinPage);
    }
});

export { test, expect };
