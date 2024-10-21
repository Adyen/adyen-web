import { test as base, expect } from '@playwright/test';
import { OpenInvoices } from '../../models/openInvoices';
import { URL_MAP } from '../URL_MAP';

type Fixture = {
    openInvoicesPage: OpenInvoices;
    openInvoicesPage_riverty: OpenInvoices;
};

const test = base.extend<Fixture>({
    openInvoicesPage: async ({ page }, use) => {
        const openInvoicePage = new OpenInvoices(page);
        await use(openInvoicePage);
    },

    openInvoicesPage_riverty: async ({ page }, use) => {
        const openInvoicePage = new OpenInvoices(page);
        await openInvoicePage.goto(URL_MAP.rivertyWithVisibleSrPanel);
        await use(openInvoicePage);
    }
});

export { test, expect };
