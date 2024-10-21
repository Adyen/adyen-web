import { test as base, expect } from '@playwright/test';
import { IssuerList } from '../../models/issuer-list';
import { getStoryUrl } from '../../tests/utils/getStoryUrl';
import { URL_MAP } from '../URL_MAP';

type Fixture = {
    issuerListPage: IssuerList;
};

const test = base.extend<Fixture>({
    issuerListPage: async ({ page }, use) => {
        const issuerListPage = new IssuerList(page);
        const issuers = [
            {
                id: '73',
                name: 'BLIK'
            },

            {
                id: '81',
                name: 'Idea Cloud'
            },

            {
                id: '68',
                name: 'mRaty'
            },
            {
                id: '1',
                name: 'mTransfer'
            },
            {
                id: '91',
                name: 'Nest Bank'
            }
        ];
        await issuerListPage.goto(getStoryUrl(URL_MAP.onlineBankingPL, { issuers }));
        await use(issuerListPage);
    }
});

export { test, expect };
