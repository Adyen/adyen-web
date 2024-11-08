import { test, expect } from '../../../fixtures/card.fixture';
import { pressEnter } from '../../utils/keyboard';
import { PAYMENT_RESULT, REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../utils/constants';
import { URL_MAP } from '../../../fixtures/URL_MAP';
import LANG from '../../../../server/translations/en-US.json';

const EXPIRY_DATE_ERROR_EMPTY = LANG['cc.dat.910'];
const CVC_ERROR_EMPTY = LANG['cc.cvc.920'];

test('#1 Filling PAN then pressing Enter will trigger validation ', async ({ page, card }) => {
    await card.goto(URL_MAP.card);
    await card.typeCardNumber(REGULAR_TEST_CARD);
    await pressEnter(page);

    await expect(card.expiryDateErrorElement).toBeVisible();
    await expect(card.expiryDateErrorElement).toHaveText(EXPIRY_DATE_ERROR_EMPTY);

    await expect(card.cvcErrorElement).toBeVisible();
    await expect(card.cvcErrorElement).toHaveText(CVC_ERROR_EMPTY);
});

test('#2 Filling in card fields then pressing Enter will trigger submission ', async ({ page, card }) => {
    await card.goto(URL_MAP.card);
    await card.typeCardNumber(REGULAR_TEST_CARD);
    await card.typeCvc(TEST_CVC_VALUE);
    await card.typeExpiryDate(TEST_DATE_VALUE);

    await pressEnter(page);

    await expect(card.paymentResult).toHaveText(PAYMENT_RESULT.authorised);
});
