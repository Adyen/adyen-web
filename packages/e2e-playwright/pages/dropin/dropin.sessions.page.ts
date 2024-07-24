import { Locator, Page } from '@playwright/test';
import { Dropin } from '../../models/dropin';

class DropinSessionsPage {
    readonly page: Page;

    readonly dropin: Dropin;
    readonly payButton: Locator;
    readonly saveDetailsButton: Locator;
    private _paymentMethods: Array<{ name: string; type: string }>;

    constructor(page: Page) {
        this.page = page;
        this.dropin = new Dropin(page, this);
        this.payButton = page.getByRole('button', { name: /Pay/i });
        this.saveDetailsButton = page.getByRole('button', { name: /Save details/i });
    }

    async goto(url?: string) {
        await this.page.goto('http://localhost:3024/dropinsessions');
        const response = await this.page.waitForResponse(response => response.url().includes('setup') && response.status() === 200);
        this._paymentMethods = (await response.json()).paymentMethods.paymentMethods.map(({ name, type }: { name: string; type: string }) => ({
            name,
            type
        }));
    }

    async pay() {
        await this.payButton.click();
    }

    async saveDetails() {
        await this.saveDetailsButton.click();
    }

    get paymentMethods() {
        return this._paymentMethods;
    }
}

export { DropinSessionsPage };
