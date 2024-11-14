import { test, expect } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import { CARD_WITH_PAN_LENGTH, REGULAR_TEST_CARD } from '../../../../utils/constants';

import { mocks } from './mocks';
import { binLookupUrl, getBinLookupMock, turnOffSDKMocking } from '../../cardMocks';
import { binLookupMock } from '../../../../../mocks/binLookup/binLookup.mock';
import {
    hiddenDateWithPanLengthMock,
    optionalDateAndCvcWithPanLengthMock,
    optionalDateWithPanLengthMock
} from '../../../../../mocks/binLookup/binLookup.data';

/**
 * NOTE - we are mocking the response until such time as we have a genuine card that returns the properties we want to test
 */

let currentMock = null;

const getMock = val => {
    const mock = mocks[val];
    currentMock = getBinLookupMock(binLookupUrl, mock);
    return currentMock;
};

const removeRequestHook = async () => {
    if (currentMock) {
        // await t.removeRequestHooks(currentMock); // don't know if this is strictly necessary}
    }
};

test.describe('Test how Card Component handles binLookup returning a panLength property (or not)', () => {
    test("#1 Fill out PAN & see that focus stays on number field since binLookup doesn't return a panLength", async ({ card, page }) => {
        await card.goto(URL_MAP.card);

        await card.isComponentVisible();

        // Check start state
        await expect(card.cardNumberLabelWithFocus).not.toBeVisible();

        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect focus to be still be on number field
        await expect(card.cardNumberLabelWithFocus).toBeVisible();
        await expect(card.expiryDateLabelWithFocus).not.toBeVisible();
    });

    test('#2 Fill out PAN(binLookup w. panLength), maxLength is set on cardNumber SF, and that focus moves to expiryDate', async ({ card, page }) => {
        await card.goto(URL_MAP.card);

        await card.isComponentVisible();

        await card.typeCardNumber(CARD_WITH_PAN_LENGTH);

        // Expect UI change - expiryDate field has focus
        await expect(card.cardNumberLabelWithFocus).not.toBeVisible();
        await expect(card.expiryDateLabelWithFocus).toBeVisible();

        // Expect iframe to exist in number field with maxlength attr set to 19
        let panInputMaxLength = await card.cardNumberInput.getAttribute('maxlength');
        expect(panInputMaxLength).toEqual('19');

        // Delete number and see that the maxlength is reset on the iframe
        await card.deleteCardNumber();
        panInputMaxLength = await card.cardNumberInput.getAttribute('maxlength');

        expect(panInputMaxLength).toEqual('24');
    });

    test('#3 Fill out PAN (binLookup w. panLength) see that focus moves to CVC since expiryDate is optional', async ({ card, page }) => {
        await binLookupMock(page, optionalDateWithPanLengthMock);

        await card.goto(URL_MAP.card);

        await card.isComponentVisible();

        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect UI change - cvc field has focus
        await expect(card.cardNumberLabelWithFocus).not.toBeVisible();
        await expect(card.cvcLabelWithFocus).toBeVisible();
    });

    test('#4 Fill out PAN (binLookup w. panLength) see that focus moves to CVC since expiryDate is hidden', async ({ card, page }) => {
        await binLookupMock(page, hiddenDateWithPanLengthMock);

        await card.goto(URL_MAP.card);

        await card.isComponentVisible();

        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect UI change - cvc field has focus
        await expect(card.cardNumberLabelWithFocus).not.toBeVisible();
        await expect(card.cvcLabelWithFocus).toBeVisible();
    });

    test('#5 Fill out PAN (binLookup w. panLength) see that focus moves to holderName since expiryDate & cvc are optional', async ({
        card,
        page
    }) => {
        await binLookupMock(page, optionalDateAndCvcWithPanLengthMock);

        const componentConfig = { hasHolderName: true, holderNameRequired: true };

        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        await card.isComponentVisible();

        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect UI change - holderName field has focus
        await expect(card.cardNumberLabelWithFocus).not.toBeVisible();
        await expect(card.holderNameLabelWithFocus).toBeVisible();
    });

    test.only('#6 Fill out invalid date on an optional date field, then fill PAN (binLookup w. panLength) see that focus moves to (optional) expiryDate since expiryDate is in error', async ({
        card,
        page
    }) => {
        await binLookupMock(page, optionalDateWithPanLengthMock);

        await card.goto(URL_MAP.card);

        await card.isComponentVisible();

        // Card out of date
        await card.fillExpiryDate('12/90');

        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect UI change - expiryDate field has focus
        await expect(card.cardNumberLabelWithFocus).not.toBeVisible();
        await expect(card.expiryDateLabelWithFocus).toBeVisible();

        await page.waitForTimeout(5000);
    });
    return;

    test('#7 Fill out PAN by **pasting** number (binLookup w. panLength) & see that maxLength is set on number SF and that focus moves to expiryDate', async () => {
        // await removeRequestHook(t);
        // await t.addRequestHooks(getMock('panLength'));
        //
        // // Wait for field to appear in DOM
        // await cardPage.numHolder();
        //
        // await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD, 'paste');
        //
        // // Expect iframe to exist in number field with maxlength attr set to 19
        // await t
        //   .switchToIframe(cardPage.iframeSelector.nth(0))
        //   .expect(Selector('[data-fieldtype="encryptedCardNumber"]').getAttribute('maxlength'))
        //   .eql('19') // 4 blocks of 4 numbers with 3 spaces in between
        //   .switchToMainWindow();
        //
        // // Expect focus to be place on Expiry date field
        // await t.expect(cardPage.dateLabelWithFocus.exists).ok();
    });

    test(
        "#8 Fill out PAN with binLookup panLength of 18 and see that when you fill in the 16th digit the focus doesn't jump " +
            ' then complete the number to 18 digits and see the focus jump' +
            ' then delete the number and add an amex one and see the focus now jumps after 15 digits',
        async () => {
            // await removeRequestHook(t);
            // await t.addRequestHooks(getMock('multiLengthMaestro'));
            //
            // // Wait for field to appear in DOM
            // await cardPage.numHolder();
            //
            // let firstDigits = MULTI_LUHN_MAESTRO.substring(0, 15);
            // const middleDigits = MULTI_LUHN_MAESTRO.substring(15, 16);
            // let lastDigits = MULTI_LUHN_MAESTRO.substring(16, 18);
            //
            // await cardPage.cardUtils.fillCardNumber(t, firstDigits);
            //
            // await t.wait(INPUT_DELAY);
            //
            // await cardPage.cardUtils.fillCardNumber(t, middleDigits);
            //
            // // Expect focus to be still be on number field
            // await t.expect(cardPage.numLabelWithFocus.exists).ok();
            // await t.expect(cardPage.dateLabelWithFocus.exists).notOk();
            // await t.wait(INPUT_DELAY);
            // await cardPage.cardUtils.fillCardNumber(t, lastDigits);
            //
            // // Expect focus to be placed on Expiry date field
            // await t.expect(cardPage.dateLabelWithFocus.exists).ok();
            //
            // // Then delete number & enter new number with a different binLookup response to see that focus now jumps after 15 digits
            // await cardPage.cardUtils.deleteCardNumber(t);
            //
            // await removeRequestHook(t);
            // await t.addRequestHooks(getMock('amexMock'));
            //
            // firstDigits = AMEX_CARD.substring(0, 14);
            // let endDigits = AMEX_CARD.substring(14, 15);
            //
            // await cardPage.cardUtils.fillCardNumber(t, firstDigits);
            // await t.wait(INPUT_DELAY);
            // await cardPage.cardUtils.fillCardNumber(t, endDigits);
            //
            // // Expect focus to be place on Expiry date field
            // await t.expect(cardPage.dateLabelWithFocus.exists).ok();
        }
    );

    test('#9 Fill out PAN with Visa num that binLookup says has a panLength of 16 - you should not then be able to type more digits in the card number field', async () => {
        // await removeRequestHook(t);
        // await t.addRequestHooks(getMock('visaMock'));
        //
        // // Wait for field to appear in DOM
        // await cardPage.numHolder();
        //
        // const firstDigits = REGULAR_TEST_CARD.substring(0, 15);
        // const lastDigits = REGULAR_TEST_CARD.substring(15, 16);
        //
        // await cardPage.cardUtils.fillCardNumber(t, firstDigits);
        //
        // await t.wait(INPUT_DELAY);
        //
        // await cardPage.cardUtils.fillCardNumber(t, lastDigits);
        //
        // // Expect focus to be place on date field
        // await t.expect(cardPage.dateLabelWithFocus.exists).ok();
        //
        // // Should not be able to add more digits to the PAN
        // await cardPage.cardUtils.fillCardNumber(t, '6');
        // await checkIframeInputContainsValue(t, cardPage.iframeSelector, 0, '.js-iframe-input', '5500 0000 0000 0004');
    });
});
