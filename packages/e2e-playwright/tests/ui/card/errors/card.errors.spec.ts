import { test, expect } from '../../../../fixtures/card.fixture';
import { REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../../utils/constants';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import LANG from '../../../../../server/translations/en-US.json';

const ERROR_ENTER_PAN = LANG['cc.num.900'];
const ERROR_ENTER_DATE = LANG['cc.dat.910'];
const ERROR_ENTER_CVC = LANG['cc.cvc.920'];

test.describe('Card - UI errors', () => {
    test('#1 Not filling in card fields should lead to errors, which are cleared when fields are filled', async ({ card, page }) => {
        await card.goto(URL_MAP.card);
        await card.isComponentVisible();
        await card.pay();

        // Expect errors
        await expect(card.cardNumberErrorElement).toBeVisible();
        await expect(card.cardNumberErrorElement).toHaveText(ERROR_ENTER_PAN);

        await expect(card.expiryDateErrorElement).toBeVisible();
        await expect(card.expiryDateErrorElement).toHaveText(ERROR_ENTER_DATE);

        await expect(card.cvcErrorElement).toBeVisible();
        await expect(card.cvcErrorElement).toHaveText(ERROR_ENTER_CVC);

        await page.waitForTimeout(300); // leave time for focus to shift

        await card.typeCardNumber(REGULAR_TEST_CARD);
        await card.typeExpiryDate(TEST_DATE_VALUE);
        await card.typeCvc(TEST_CVC_VALUE);

        // Expect no errors
        await expect(card.cardNumberErrorElement).not.toBeVisible();
        await expect(card.expiryDateErrorElement).not.toBeVisible();
        await expect(card.cvcErrorElement).not.toBeVisible();
    });
});
