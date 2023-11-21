import { test as base, expect } from '@playwright/test';
import { AncvPage } from './ancv.page';
import { sessionsMock } from '../../mocks/sessions/sessions.mock';
import { sessionsMockData } from '../../mocks/sessions/sessions.data';
import { setupMock } from '../../mocks/setup/setup.mock';
import { setupMockData } from '../../mocks/setup/setup.data';
import { Card } from '../../models/card';

type Fixture = {
    ancvPage: AncvPage;
    card: Card;
};

const test = base.extend<Fixture>({
    ancvPage: async ({ page }, use) => {
        const ancvPage = new AncvPage(page);

        await sessionsMock(page, sessionsMockData);
        await setupMock(page, setupMockData);
        await ancvPage.goto();
        await use(ancvPage);
    }
});

export { test, expect };
