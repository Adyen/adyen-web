import { Locator, Page } from '@playwright/test';
import { Redirect } from '../../models/redirect';

class RedirectPage {
    readonly page: Page;

    public readonly redirectModel: Redirect;

    readonly redirectButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.redirectModel = new Redirect(page);
        this.redirectButton = page.getByRole('button', { name: /Continue to iDEAL/i });
    }

    async goto(url?: string) {
        await this.page.goto('http://localhost:3024/redirects?countryCode=NL');
    }

    async redirect() {
        await this.redirectButton.click();
    }
}

export { RedirectPage };
