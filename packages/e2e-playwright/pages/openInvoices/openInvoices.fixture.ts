import { test as base, expect, Page } from '@playwright/test';
import { OpenInvoicesPage } from './openInvoices.page';
type Fixture = {
    openInvoicesPage: OpenInvoicesPage;
    openInvoicesPage_riverty: OpenInvoicesPage;
};

const test = base.extend<Fixture>({
    openInvoicesPage: async ({ page }, use) => {
        await useOpenInvoicesPage(page, use);
    },

    openInvoicesPage_riverty: async ({ page }, use) => {
        const mainConfig = JSON.stringify({
            srConfig: {
                showPanel: true
            }
        });
        await page.addInitScript({
            content: `window.mainConfiguration = ${mainConfig}`
        });

        const rivertyConfig = JSON.stringify({
            countryCode: 'DE'
        });
        await page.addInitScript({
            content: `window.rivertyConfig = ${rivertyConfig}`
        });

        await useOpenInvoicesPage(page, use);
    }
});

const useOpenInvoicesPage = async (page: Page, use: any, PageType = OpenInvoicesPage) => {
    const openInvoicesPage = new PageType(page);
    await openInvoicesPage.goto();
    await use(openInvoicesPage);
};

export { test, expect };
