import { Locator, Page } from '@playwright/test';
import { Dropin } from '../../models/dropin';

class DropinSessionsPage {
    readonly page: Page;

    readonly dropin: Dropin;
    // readonly payButton: Locator;
    readonly saveDetailsButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.dropin = new Dropin(page);
        // this.payButton = page.getByRole('button', { name: /Pay/i });
        this.saveDetailsButton = page.getByRole('button', { name: /Save details/i });
    }

    async goto(url?: string) {
        await this.page.goto('http://localhost:3024/dropinsessions');
    }

    async saveDetails() {
        await this.saveDetailsButton.click();
    }

    // async pay() {
    //     await this.payButton.click();
    // }
}

export { DropinSessionsPage };
