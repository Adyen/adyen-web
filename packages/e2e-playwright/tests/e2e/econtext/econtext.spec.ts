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

        await econtext.firstNameInput.fill(SHOPPER_DATA.firstName);
        await econtext.lastNameInput.fill(SHOPPER_DATA.lastName);
        await econtext.emailInput.fill(SHOPPER_DATA.email);
        await econtext.telephoneInput.fill(SHOPPER_DATA.telephoneNumber);

        await econtext.pay();

        await expect(econtext.voucherResult).toBeVisible();
    });
});

test.describe('Econtext Seven Eleven', () => {
    test('should redirect for an Econtext Seven Eleven payment', async ({ econtext, page }) => {
        await econtext.goto(URL_MAP.econtextSevenEleven);

        await econtext.firstNameInput.fill(SHOPPER_DATA.firstName);
        await econtext.lastNameInput.fill(SHOPPER_DATA.lastName);
        await econtext.emailInput.fill(SHOPPER_DATA.email);
        await econtext.telephoneInput.fill(SHOPPER_DATA.telephoneNumber);

        await econtext.pay();

        await page.waitForURL(url => !url.href.includes(URL_MAP.econtextSevenEleven));
    });
});
