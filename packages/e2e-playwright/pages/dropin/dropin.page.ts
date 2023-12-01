import { Locator, Page } from '@playwright/test';
import { Dropin } from '../../models/dropin';

class DropinPage {
    readonly page: Page;

    readonly dropin: Dropin;
    // readonly payButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.dropin = new Dropin(page);
        // this.payButton = page.getByRole('button', { name: /Pay/i });
    }

    async goto(url?: string) {
        await this.page.goto('http://localhost:3024');
    }

    // async pay() {
    //     await this.payButton.click();
    // }
}

export { DropinPage };
