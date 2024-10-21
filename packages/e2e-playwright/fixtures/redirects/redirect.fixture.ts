import { test as base, expect, Page } from '@playwright/test';
import { RedirectPage } from './redirect.page';

type Fixture = {
    redirectPage: RedirectPage;
    redirectPageIdeal: RedirectPage;
};

const test = base.extend<Fixture>({
    redirectPage: async ({ page }, use) => {
        await useRedirectPage(page, use);
    },

    //{ type: 'ideal' }
    redirectPageIdeal: async ({ page }, use) => {
        const redirectConfig = JSON.stringify({ type: 'ideal' });
        await page.addInitScript({
            content: `window.redirectConfig = ${redirectConfig}`
        });

        await useRedirectPage(page, use);
    }
});

const useRedirectPage = async (page: Page, use: any, PageType: any = RedirectPage) => {
    const redirectPage = new PageType(page);
    await redirectPage.goto();
    await use(redirectPage);
};

export { test, expect };
