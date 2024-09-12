import { test, expect } from '../../pages/cards/card.fixture';
import { REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../utils/constants';
import LANG from '../../../server/translations/en-US.json';
import { pressEnter } from '../utils/keyboard';

const PAN_ERROR_NOT_VALID = LANG['cc.num.902'];
const PAN_ERROR_EMPTY = LANG['cc.num.900'];
const PAN_ERROR_NOT_COMPLETE = LANG['cc.num.901'];

const EXPIRY_DATE_ERROR_EMPTY = LANG['cc.dat.910'];
const CVC_ERROR_EMPTY = LANG['cc.cvc.920'];

test.describe('Card - Standard flow', () => {
    test('#1 Should fill in card fields and complete the payment', async ({ cardPage }) => {
        const { card, page } = cardPage;

        await card.typeCardNumber(REGULAR_TEST_CARD);
        await card.typeCvc(TEST_CVC_VALUE);
        await card.typeExpiryDate(TEST_DATE_VALUE);

        await cardPage.pay();

        await expect(page.locator('#result-message')).toHaveText('Authorised');
    });

    test('#2 PAN that consists of the same digit (but passes luhn) causes an error', async ({ cardPage }) => {
        const { card, page } = cardPage;

        await card.typeCardNumber('3333 3333 3333 3333 3333');

        await cardPage.pay();

        await expect(card.cardNumberErrorElement).toBeVisible();
        await expect(card.cardNumberErrorElement).toHaveText(PAN_ERROR_NOT_VALID);
    });

    test('#3 Clicking pay button with an empty PAN causes an "empty" error on the PAN field', async ({ cardPage }) => {
        const { card, page } = cardPage;

        await cardPage.pay();

        await expect(card.cardNumberErrorElement).toBeVisible();
        await expect(card.cardNumberErrorElement).toHaveText(PAN_ERROR_EMPTY);
    });

    test('#4 PAN that consists of only 1 digit causes a "wrong length" error ', async ({ cardPage }) => {
        const { card, page } = cardPage;

        await card.typeCardNumber('4');

        await cardPage.pay();

        await expect(card.cardNumberErrorElement).toBeVisible();
        await expect(card.cardNumberErrorElement).toHaveText(PAN_ERROR_NOT_COMPLETE);
    });

    test('#5 Filling PAN then pressing Enter will trigger validation ', async ({ cardPage }) => {
        const { card, page } = cardPage;

        await card.isComponentVisible();
        await card.typeCardNumber(REGULAR_TEST_CARD);

        await pressEnter(page);

        await page.waitForTimeout(500); // wait for UI to show errors

        await expect(card.expiryDateErrorElement).toBeVisible();
        await expect(card.expiryDateErrorElement).toHaveText(EXPIRY_DATE_ERROR_EMPTY);

        await expect(card.cvcErrorElement).toBeVisible();
        await expect(card.cvcErrorElement).toHaveText(CVC_ERROR_EMPTY);
    });

    test('#6 Filling in card fields then pressing Enter will trigger submission ', async ({ cardPage }) => {
        const { card, page } = cardPage;

        await card.isComponentVisible();

        await card.typeCardNumber(REGULAR_TEST_CARD);
        await card.typeCvc(TEST_CVC_VALUE);
        await card.typeExpiryDate(TEST_DATE_VALUE);

        await pressEnter(page);

        await expect(page.locator('#result-message')).toHaveText('Authorised');
    });
});
