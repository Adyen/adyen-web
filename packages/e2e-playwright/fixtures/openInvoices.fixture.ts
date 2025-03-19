import { test as base, expect } from './base-fixture';
import { OpenInvoices } from '../models/openInvoices';
import { URL_MAP } from './URL_MAP';

type Fixture = {
    //openInvoicesPage: OpenInvoices;
    riverty: OpenInvoices;
};

const test = base.extend<Fixture>({
    /*    openInvoicesPage: async ({ page }, use) => {
        const openInvoicePage = new OpenInvoices(page);
        await use(openInvoicePage);
    },*/

    riverty: async ({ page }, use) => {
        const openInvoicePage = new OpenInvoices(page);
        await openInvoicePage.goto(URL_MAP.rivertyWithVisibleSrPanel);
        await use(openInvoicePage);
    }
});

export { test, expect };
