import { test as base, expect } from '../../../fixtures/base-fixture';
import Econtext from '../../../models/econtext';
import { URL_MAP } from '../../../fixtures/URL_MAP';
import { SHOPPER_DATA } from '../../utils/constants';

type Fixture = {
    econtext: Econtext;
};

const test = base.extend<Fixture>({
    econtext: async ({ page }, use) => {
        const econtext = new Econtext(page);
        await use(econtext);
    }
});

test.describe('Econtext ATM', () => {
    test('should make an Econtext ATM payment', async ({ econtext }) => {
        await econtext.goto(URL_MAP.econtextAtm);
        await econtext.fillShopperData()
        await econtext.pay();
        await expect(econtext.voucherResult).toBeVisible();
    });
});

test.describe('Econtext Seven Eleven', () => {
    test('should redirect for an Econtext Seven Eleven payment', async ({ econtext }) => {
        await econtext.goto(URL_MAP.econtextSevenEleven);
        await econtext.fillShopperData()
        await econtext.pay();
        await econtext.page.waitForURL(url => !url.href.includes(URL_MAP.econtextSevenEleven));
        await expect(econtext.page).not.toHaveURL(URL_MAP.econtextSevenEleven, { timeout: 5000 }); 
    });
});
