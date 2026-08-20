import { expect, test } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import { DUAL_BRANDED_CARD } from '../../../../utils/constants';

import LANG from '../../../../../../server/translations/en-US.json';
import { binLookupMock } from '../../../../../mocks/binLookup/binLookup.mock';
import { dualBrandedVisaCreditAndCbDebit } from '../../../../../mocks/binLookup/binLookup.data';

const PAN_ERROR_UNSUPPORTED_FUNDING_SOURCE = LANG['cc.num.904'];

const componentConfig = {
    brands: ['mc', 'visa', 'amex', 'cartebancaire'],
    configuration: {
        allowedFundingSources: 'debit'
    }
};

const expectEncryptedCardNumber = (page, present: boolean) =>
    expect
        .poll(async () => {
            const cardData: any = await page.evaluate('window.component.data');
            return Boolean(cardData.paymentMethod.encryptedCardNumber);
        })
        .toBe(present);

const expectBrand = (page, brand: string) =>
    expect
        .poll(async () => {
            const cardData: any = await page.evaluate('window.component.data');
            return cardData.paymentMethod.brand;
        })
        .toBe(brand);

test.describe('Card - Funding source validation on a dual branded card', () => {
    test('should preselect the allowed brand, stop encrypting on the disallowed one, and recover on switching back', async ({ card, page }) => {
        await binLookupMock(page, dualBrandedVisaCreditAndCbDebit);
        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        await card.typeCardNumber(DUAL_BRANDED_CARD);

        await expect(card.isBrandSelected(/cartebancaire/i)).resolves.toBe(true);
        await expect(card.getBrandOptionCount()).resolves.toBe(2);
        await expectBrand(page, 'cartebancaire');
        await expectEncryptedCardNumber(page, true);

        await card.selectBrand(/visa/i);

        await expect(card.cardNumberErrorElement).toBeVisible();
        await expect(card.cardNumberErrorElement).toHaveText(PAN_ERROR_UNSUPPORTED_FUNDING_SOURCE);

        await expect(card.getBrandOptionCount()).resolves.toBe(2);
        await expectEncryptedCardNumber(page, false);

        await card.selectBrand(/cartebancaire/i);

        await expect(card.cardNumberErrorElement).not.toBeVisible();
        await expectEncryptedCardNumber(page, true);
        await expectBrand(page, 'cartebancaire');
    });
});
