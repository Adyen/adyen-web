import { test, expect } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { SYNCHRONY_PLCC_NO_LUHN_BUT_FAILS_LUHN, TEST_CVC_VALUE } from '../../../../utils/constants';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';

test.describe('Testing a PLCC, for a response that should indicate luhn check is not required)', () => {
    test('Test plcc card becomes valid with number that fails luhn check ', async ({ card, page }) => {
        //
        const componentConfig = { brands: ['mc', 'visa', 'amex', 'bcmc', 'synchrony_plcc'] };

        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        await card.isComponentVisible();

        // number that identifies as plcc but fails luhn
        await card.typeCardNumber(SYNCHRONY_PLCC_NO_LUHN_BUT_FAILS_LUHN);

        // confirm plcc brand
        let brandingIconSrc = await card.brandingIcon.getAttribute('src');
        expect(brandingIconSrc).toContain('synchrony_plcc.svg');

        // fill cvc
        await card.typeCvc(TEST_CVC_VALUE);

        // PM is valid
        let cardValid = await page.evaluate('window.component.isValid');
        expect(cardValid).toEqual(true);

        // Delete number
        await card.deleteCardNumber();

        // UI reset
        brandingIconSrc = await card.brandingIcon.getAttribute('src');
        expect(brandingIconSrc).toContain('nocard.svg');

        // PM is not valid
        cardValid = await page.evaluate('window.component.isValid');
        expect(cardValid).toEqual(false);
    });
});
