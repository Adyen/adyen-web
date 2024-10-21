import { test, expect } from '../../../../fixtures/cards/card.fixture';
import LANG from '../../../../../server/translations/en-US.json';
import { URL_MAP } from '../../../../fixtures/URL_MAP';

const PAN_ERROR_NOT_VALID = LANG['cc.num.902'];
const PAN_ERROR_EMPTY = LANG['cc.num.900'];
const PAN_ERROR_NOT_COMPLETE = LANG['cc.num.901'];

test('#2 PAN that consists of the same digit (but passes luhn) causes an error', async ({ page, cardPage }) => {
    await cardPage.goto(URL_MAP.card);
    await cardPage.typeCardNumber('3333 3333 3333 3333 3333');
    await cardPage.pay();

    await expect(cardPage.cardNumberErrorElement).toBeVisible();
    await expect(cardPage.cardNumberErrorElement).toHaveText(PAN_ERROR_NOT_VALID);
});

test('#3 Clicking pay button with an empty PAN causes an "empty" error on the PAN field', async ({ cardPage }) => {
    await cardPage.goto(URL_MAP.card);
    await cardPage.pay();

    await expect(cardPage.cardNumberErrorElement).toBeVisible();
    await expect(cardPage.cardNumberErrorElement).toHaveText(PAN_ERROR_EMPTY);
});

test('#4 PAN that consists of only 1 digit causes a "wrong length" error ', async ({ cardPage }) => {
    await cardPage.goto(URL_MAP.card);
    await cardPage.typeCardNumber('4');
    await cardPage.pay();

    await expect(cardPage.cardNumberErrorElement).toBeVisible();
    await expect(cardPage.cardNumberErrorElement).toHaveText(PAN_ERROR_NOT_COMPLETE);
});
