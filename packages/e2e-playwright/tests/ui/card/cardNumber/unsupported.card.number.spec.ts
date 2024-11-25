import { expect, test } from '../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { PAYMENT_RESULT, REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE, VISA_CARD } from '../../../utils/constants';
import LANG from '../../../../../server/translations/en-US.json';

const PAN_ERROR_NOT_SUPPORTED = LANG['cc.num.903'];

test(
    '#1 Enter number of unsupported card, ' + 'then check UI shows an error ' + 'then PASTE supported card & check UI error is cleared',
    async () => {
        // Wait for field to appear in DOM
        // Fill card field with unsupported number
        // Test UI shows "Unsupported card" error
        // Past card field with supported number
        // Test UI shows "Unsupported card" error has gone
    }
);

test(
    '#2 Enter number of unsupported card, ' +
        'then check UI shows an error ' +
        'then press the Pay button ' +
        'then check UI shows more errors ' +
        'then PASTE supported card & check PAN UI errors are cleared whilst others persist',
    async () => {
        // Wait for field to appear in DOM
        // Fill card field with unsupported number
        // Test UI shows "Unsupported card" error
        // Click Pay (which will call showValidation on all fields)
        // Past card field with supported number
        // Test UI shows "Unsupported card" error has gone
        // PAN error cleared but other errors persist
    }
);

test('#3 Enter number of unsupported card, ' + 'then check UI shows an error ' + 'then PASTE card not in db check UI error is cleared', async () => {
    // Wait for field to appear in DOM
    // Fill card field with unsupported number
    // Test UI shows "Unsupported card" error
    // Past card field with supported number
    // Test UI shows "Unsupported card" error has gone
});

test('#4 Enter number of unsupported card, ' + 'then check UI shows an error ' + 'then delete PAN & check UI error is cleared', async () => {
    // Wait for field to appear in DOM
    // Fill card field with unsupported number
    // Test UI shows "Unsupported card" error
    // delete card number
    // Test UI shows "Unsupported card" error has gone
});

test('#5 Test that after an unsupported card has been entered PASTING in full supported card makes it possible to pay', async ({ card, page }) => {
    //
    const componentConfig = { brands: ['mc'] };

    await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

    await card.isComponentVisible();

    // Fill unsupported card
    await card.fillCardNumber(VISA_CARD);
    await page.waitForTimeout(100);

    await card.typeExpiryDate(TEST_DATE_VALUE);
    await card.typeCvc(TEST_CVC_VALUE);

    await expect(card.cardNumberErrorElement).toBeVisible();
    await expect(card.cardNumberErrorElement).toHaveText(PAN_ERROR_NOT_SUPPORTED);

    // "Paste" number that is supported
    await card.fillCardNumber(REGULAR_TEST_CARD);
    await page.waitForTimeout(100);

    // If correct events have fired expect the card to be valid
    await expect(card.cardNumberErrorElement).not.toBeVisible();
    await card.pay();
    await expect(card.paymentResult).toHaveText(PAYMENT_RESULT.authorised);
});
