import { expect, test } from '../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { PAYMENT_RESULT, REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE, UNKNOWN_BIN_CARD, VISA_CARD } from '../../../utils/constants';
import LANG from '../../../../../server/translations/en-US.json';

const PAN_ERROR_NOT_SUPPORTED = LANG['cc.num.903'];

test('#1 Test that after an unsupported card has been entered we see errors, PASTING in a full supported card clears errors & makes it possible to pay', async ({
    card,
    page
}) => {
    //
    const componentConfig = { brands: ['mc'] };

    await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

    await card.isComponentVisible();

    // Fill unsupported card
    await card.typeCardNumber(VISA_CARD);
    await page.waitForTimeout(100);

    await card.typeExpiryDate(TEST_DATE_VALUE);
    await card.typeCvc(TEST_CVC_VALUE);

    await expect(card.cardNumberErrorElement).toBeVisible();
    await expect(card.cardNumberErrorElement).toHaveText(PAN_ERROR_NOT_SUPPORTED);

    // "Paste" number that is supported
    await card.typeCardNumber(REGULAR_TEST_CARD);
    await page.waitForTimeout(100);

    // If correct events have fired expect the card to not have errors
    await expect(card.cardNumberErrorElement).not.toBeVisible();

    // And to be valid
    await card.pay();
    await expect(card.paymentResult).toHaveText(PAYMENT_RESULT.authorised);
});

test(
    '#2 Enter number of unsupported card, ' + 'then check UI shows an error ' + 'then PASTE card not in db & check UI error is cleared',
    async ({ card, page }) => {
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

        // "Paste" number that is unknown
        await card.fillCardNumber(UNKNOWN_BIN_CARD);
        await page.waitForTimeout(100);

        // If correct events have fired expect the card to not have errors
        await expect(card.cardNumberErrorElement).not.toBeVisible();
    }
);

test(
    '#3 Enter number of unsupported card, ' + 'then check UI shows an error ' + 'then delete PAN & check UI error is cleared',
    async ({ card, page }) => {
        const componentConfig = { brands: ['mc'] };

        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        await card.isComponentVisible();

        // Fill unsupported card
        await card.fillCardNumber(VISA_CARD);
        await page.waitForTimeout(100);

        await expect(card.cardNumberErrorElement).toBeVisible();
        await expect(card.cardNumberErrorElement).toHaveText(PAN_ERROR_NOT_SUPPORTED);

        await page.waitForTimeout(300); // leave time for focus to shift

        await card.deleteCardNumber();
        await expect(card.cardNumberErrorElement).not.toBeVisible();
    }
);
