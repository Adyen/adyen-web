import { test as base, expect } from '@playwright/test';
import { IssuerList } from '../models/issuer-list';
import { getStoryUrl } from '../tests/utils/getStoryUrl';
import { URL_MAP } from './URL_MAP';

type Fixture = {
    onlineBankingPL: IssuerList;
};

const test = base.extend<Fixture>({
    onlineBankingPL: async ({ page }, use) => {
        const issuerListPage = new IssuerList(page);
        const issuers = [
            {
                id: '154',
                name: 'BLIK'
            },

            {
                id: '141',
                name: 'e-transfer Pocztowy24'
            }
        ];
        await issuerListPage.goto(
            getStoryUrl({
                baseUrl: URL_MAP.onlineBankingPL,
                componentConfig: {
                    highlightedIssuers: issuers.map(issuer => issuer.id)
                }
            })
        );
        await use(issuerListPage);
    }
});

export { test, expect };
