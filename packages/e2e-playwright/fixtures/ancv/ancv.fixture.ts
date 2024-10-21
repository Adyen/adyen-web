import { test as base, expect } from '@playwright/test';
import { sessionsMock } from '../../mocks/sessions/sessions.mock';
import { sessionsMockData } from '../../mocks/sessions/sessions.data';
import { setupMock } from '../../mocks/setup/setup.mock';
import { setupMockData } from '../../mocks/setup/setup.data';
import { ANCV } from '../../models/ancv';
import { URL_MAP } from '../URL_MAP';

type Fixture = {
    ancvPage: ANCV;
};

const test = base.extend<Fixture>({
    ancvPage: async ({ page }, use) => {
        const ancvPage = new ANCV(page);
        await sessionsMock(page, sessionsMockData);
        await setupMock(page, setupMockData);
        await ancvPage.goto(URL_MAP.ancv);
        await use(ancvPage);
    }
});

export { test, expect };
