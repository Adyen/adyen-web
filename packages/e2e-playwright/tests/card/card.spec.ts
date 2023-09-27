import { test, expect } from '../../pages/cards/card.fixture';
import { REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../utils/constants';
import LANG from '../../../lib/src/language/locales/en-US.json';

const PAN_ERROR_NOT_VALID = LANG['error.va.sf-cc-num.01'];
const PAN_ERROR_EMPTY = LANG['error.va.sf-cc-num.02'];
const PAN_ERROR_NOT_COMPLETE = LANG['error.va.sf-cc-num.04'];

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
