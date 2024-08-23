import { test, expect } from '../../../../pages/cards/card.fixture';
import LANG from '../../../../../server/translations/en-US.json';

const PAN_ERROR_NOT_VALID = LANG['cc.num.902'];
const PAN_ERROR_EMPTY = LANG['cc.num.900'];
const PAN_ERROR_NOT_COMPLETE = LANG['cc.num.901'];

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
