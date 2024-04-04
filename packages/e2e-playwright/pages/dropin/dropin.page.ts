import { Page } from '@playwright/test';
import { Dropin } from '../../models/dropin';

class DropinPage {
    readonly page: Page;

    readonly dropin: Dropin;
    private _paymentMethods: Array<{ name: string; type: string }>;

    constructor(page: Page) {
        this.page = page;
        this.dropin = new Dropin(page, this);
    }

    async goto(url?: string) {
        await this.page.goto('http://localhost:3024');
        const response = await this.page.waitForResponse(response => response.url().includes('paymentMethods') && response.status() === 200);
        this._paymentMethods = (await response.json()).paymentMethods.map(({ name, type }: { name: string; type: string }) => ({ name, type }));
    }

    get paymentMethods() {
        return this._paymentMethods;
    }
}

export { DropinPage };
