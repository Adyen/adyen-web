import { Page } from '@playwright/test';
import { IssuerList } from '../../models/issuer-list';

class IssuerListPage {
    readonly page: Page;

    public readonly issuerList: IssuerList;

    constructor(page: Page) {
        this.page = page;
        this.issuerList = new IssuerList(page);
    }

    async goto(url?: string) {
        await this.page.goto('http://localhost:3024/issuerlists?countryCode=NL');
    }
}

export { IssuerListPage };
