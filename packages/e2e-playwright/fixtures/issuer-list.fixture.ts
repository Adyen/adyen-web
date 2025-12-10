import { test as base, expect } from './base-fixture';
import { IssuerList } from '../models/issuer-list';
import { Iris } from '../models/iris';
import { getStoryUrl } from '../tests/utils/getStoryUrl';
import { URL_MAP } from './URL_MAP';
import { ONLINE_BANKING_PL_ISSUERS, IRIS_ISSUERS } from '../tests/utils/constants';

type Fixture = {
    onlineBankingPL: IssuerList;
    iris: Iris;
};

const test = base.extend<Fixture>({
    onlineBankingPL: async ({ page }, use) => {
        const issuerListPage = new IssuerList(page);
        await issuerListPage.goto(
            getStoryUrl({
                baseUrl: URL_MAP.onlineBankingPL,
                componentConfig: {
                    highlightedIssuers: ONLINE_BANKING_PL_ISSUERS.map(issuer => issuer.id)
                }
            })
        );
        await use(issuerListPage);
    },

    iris: async ({ page }, use) => {
        const irisPage = new Iris(page);
        await irisPage.goto(
            getStoryUrl({
                baseUrl: URL_MAP.iris,
                componentConfig: {
                    highlightedIssuers: IRIS_ISSUERS.map(issuer => issuer.id)
                }
            })
        );
        await use(irisPage);
    }
});

export { test, expect };
