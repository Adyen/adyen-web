import { test as base, expect, Page } from '@playwright/test';
import { DropinPage } from './dropin.page';
import { DropinSessionsPage } from './dropin.sessions.page';

type Fixture = {
    dropinPage: DropinPage;
    dropinPage_cardBrands: DropinPage;
    dropinPage_cardBrands_withExcluded: DropinPage;
    dropinSessions_regular: DropinSessionsPage;
    dropinSessions_zeroAuthCard_success: DropinSessionsPage;
    dropinSessions_zeroAuthCard_fail: DropinSessionsPage;
};

const test = base.extend<Fixture>({
    dropinPage: async ({ page }, use) => {
        await useDropinPage(page, use);
    },

    dropinPage_cardBrands: async ({ page }, use) => {
        const pmsConfig = JSON.stringify({
            paymentMethodsConfiguration: {
                card: {
                    brands: ['visa', 'mc', 'amex', 'discover', 'cup', 'maestro', 'bijcard', 'diners', 'jcb', 'synchrony_cbcc'],
                    _disableClickToPay: true
                }
            }
        });
        await page.addInitScript({
            content: `window.dropinConfig = ${pmsConfig}`
        });

        await useDropinPage(page, use);
    },

    dropinPage_cardBrands_withExcluded: async ({ page }, use) => {
        const pmsConfig = JSON.stringify({
            paymentMethodsConfiguration: {
                card: {
                    brands: ['visa', 'mc', 'amex', 'discover', 'cup', 'maestro', 'nyce', 'accel', 'star', 'pulse'],
                    _disableClickToPay: true
                }
            }
        });
        await page.addInitScript({
            content: `window.dropinConfig = ${pmsConfig}`
        });

        await useDropinPage(page, use);
    },

    dropinSessions_regular: async ({ page }, use) => {
        const mainConfig = JSON.stringify({
            allowPaymentMethods: ['scheme']
        });

        const pmsConfig = JSON.stringify({
            paymentMethodsConfiguration: {
                card: {
                    _disableClickToPay: true
                }
            }
        });

        await page.addInitScript({
            content: `window.mainConfiguration = ${mainConfig}`
        });

        await page.addInitScript({
            content: `window.dropinConfig = ${pmsConfig}`
        });

        await useDropinPage(page, use, DropinSessionsPage);
    },

    dropinSessions_zeroAuthCard_success: async ({ page }, use) => {
        const sessionConfig = JSON.stringify({
            amount: { currency: 'USD', value: 0 },
            recurringProcessingModel: 'CardOnFile',
            storePaymentMethodMode: 'askForConsent'
        });

        const mainConfig = JSON.stringify({
            allowPaymentMethods: ['scheme']
        });

        const pmsConfig = JSON.stringify({
            paymentMethodsConfiguration: {
                card: {
                    _disableClickToPay: true
                }
            }
        });

        await page.addInitScript({
            content: `window.sessionConfig = ${sessionConfig}`
        });

        await page.addInitScript({
            content: `window.mainConfiguration = ${mainConfig}`
        });

        await page.addInitScript({
            content: `window.dropinConfig = ${pmsConfig}`
        });

        await useDropinPage(page, use, DropinSessionsPage);
    },

    dropinSessions_zeroAuthCard_fail: async ({ page }, use) => {
        const sessionConfig = JSON.stringify({
            amount: { currency: 'USD', value: 0 },
            recurringProcessingModel: 'CardOnFile',
            storePaymentMethodMode: 'askForConsent',
            enableOneClick: true // this will conflict with storePaymentMethod in the /payments request and cause the payment to fail
        });

        const mainConfig = JSON.stringify({
            allowPaymentMethods: ['scheme']
        });

        const pmsConfig = JSON.stringify({
            paymentMethodsConfiguration: {
                card: {
                    _disableClickToPay: true
                }
            }
        });

        await page.addInitScript({
            content: `window.sessionConfig = ${sessionConfig}`
        });

        await page.addInitScript({
            content: `window.mainConfiguration = ${mainConfig}`
        });

        await page.addInitScript({
            content: `window.dropinConfig = ${pmsConfig}`
        });

        await useDropinPage(page, use, DropinSessionsPage);
    }
});

const useDropinPage = async (page: Page, use: any, PageType: any = DropinPage) => {
    const dropinPage = new PageType(page);
    await dropinPage.goto();
    await use(dropinPage);
};

export { test, expect };
