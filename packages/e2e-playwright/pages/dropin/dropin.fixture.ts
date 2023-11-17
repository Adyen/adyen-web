import { test as base, expect, Page } from '@playwright/test';
import { DropinPage } from './dropin.page';

type Fixture = {
    dropinPage: DropinPage;
    dropinPage_cardBrands_defaultView: DropinPage;
};

const test = base.extend<Fixture>({
    dropinPage: async ({ page }, use) => {
        await useDropinPage(page, use);
    },

    dropinPage_cardBrands_defaultView: async ({ page }, use) => {
        const pmsConfig = JSON.stringify({
            paymentMethodsConfiguration: {
                card: {
                    showBrandsUnderCardNumber: false,
                    brands: ['visa', 'mc', 'amex', 'discover', 'cup', 'maestro', 'bijcard', 'diners', 'jcb', 'synchrony_cbcc']
                }
            }
        });
        await page.addInitScript({
            content: `window.mainConfiguration = ${pmsConfig}`
        });

        await useDropinPage(page, use);
    }
});

const useDropinPage = async (page: Page, use: any, PageType = DropinPage) => {
    const dropinPage = new PageType(page);
    await dropinPage.goto();
    await use(dropinPage);
};

export { test, expect };
