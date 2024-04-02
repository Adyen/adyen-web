import { Locator, Page } from '@playwright/test';
import { OpenInvoices } from '../../models/openInvoices';

class OpenInvoicesPage {
    readonly page: Page;

    readonly openInvoices: OpenInvoices;
    readonly payButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.openInvoices = new OpenInvoices(page);
        this.payButton = page.getByRole('button', { name: /Confirm/i });
    }

    async goto(url?: string) {
        await this.page.goto('http://localhost:3024/openinvoices');
    }

    async pay() {
        await this.payButton.click();
    }
}

export { OpenInvoicesPage };
