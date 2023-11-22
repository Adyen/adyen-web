import { test as base, expect, Page } from '@playwright/test';
import { DropinPage } from './dropin.page';

type Fixture = {
    dropinPage: DropinPage;
    dropinPage_cardBrands_defaultView: DropinPage;
    dropinPage_cardBrands_defaultView_withExcluded: DropinPage;
    dropinPage_cardBrands_compactView: DropinPage;
    dropinPage_cardBrands_compactView_withExcluded: DropinPage;
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
                    brands: ['visa', 'mc', 'amex', 'discover', 'cup', 'maestro', 'bijcard', 'diners', 'jcb', 'synchrony_cbcc'],
                    _disableClickToPay: true
                }
            }
        });
        await page.addInitScript({
            content: `window.mainConfiguration = ${pmsConfig}`
        });

        await useDropinPage(page, use);
    },

    dropinPage_cardBrands_defaultView_withExcluded: async ({ page }, use) => {
        const pmsConfig = JSON.stringify({
            paymentMethodsConfiguration: {
                card: {
                    showBrandsUnderCardNumber: false,
                    brands: ['visa', 'mc', 'amex', 'discover', 'cup', 'maestro', 'nyce', 'accel', 'star', 'pulse'],
                    _disableClickToPay: true
                }
            }
        });
        await page.addInitScript({
            content: `window.mainConfiguration = ${pmsConfig}`
        });

        await useDropinPage(page, use);
    },

    dropinPage_cardBrands_compactView: async ({ page }, use) => {
        const pmsConfig = JSON.stringify({
            paymentMethodsConfiguration: {
                card: {
                    brands: ['visa', 'mc', 'amex', 'discover', 'cup', 'maestro', 'bijcard', 'diners', 'jcb', 'synchrony_cbcc'],
                    _disableClickToPay: true
                }
            }
        });
        await page.addInitScript({
            content: `window.mainConfiguration = ${pmsConfig}`
        });

        await useDropinPage(page, use);
    },

    dropinPage_cardBrands_compactView_withExcluded: async ({ page }, use) => {
        const pmsConfig = JSON.stringify({
            paymentMethodsConfiguration: {
                card: {
                    brands: ['visa', 'mc', 'amex', 'discover', 'cup', 'maestro', 'nyce', 'accel', 'star', 'pulse'],
                    _disableClickToPay: true
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
