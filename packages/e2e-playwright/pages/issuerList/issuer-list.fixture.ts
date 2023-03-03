import { test as base, expect } from '@playwright/test';
import { IssuerListPage } from './issuer-list.page';

type Fixture = {
    issuerListPage: IssuerListPage;
};

const test = base.extend<Fixture>({
    issuerListPage: async ({ page }, use) => {
        const issuerListPage = new IssuerListPage(page);
        await issuerListPage.goto();
        await use(issuerListPage);
    }
});

export { test, expect };
