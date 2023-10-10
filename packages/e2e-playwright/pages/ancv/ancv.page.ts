import { Page } from '@playwright/test';
import { ANCV } from '../../models/ancv';

class AncvPage {
    private readonly page: Page;

    public readonly ancv: ANCV;

    constructor(page: Page) {
        this.page = page;
        this.ancv = new ANCV(page);
    }

    async goto(url?: string) {
        const gotoUrl = url ? url : 'http://localhost:3024/ancv?countryCode=NL';
        await this.page.goto(gotoUrl);
    }
}

export { AncvPage };
