import { test } from '@playwright/test';
import { mocks } from './mocks';
import { binLookupUrl, getBinLookupMock, turnOffSDKMocking } from '../../cardMocks';

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
    test.beforeEach(async () => {
        // to config panLength.regular.clientScripts.js
        //await t.navigateTo(cardPage);
        // For individual test suites (that rely on binLookup & perhaps are being run in isolation)
        // - provide a way to ensure SDK bin mocking is turned off
        await turnOffSDKMocking();
    });
    test("#1 Fill out PAN & see that focus stays on number field since binLookup doesn't return a panLength", async () => {
        // await t.addRequestHooks(getMock('noPanLength'));
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
        // // Expect focus to be still be on number field
        // await t.expect(cardPage.numLabelWithFocus.exists).ok();
        // await t.expect(cardPage.dateLabelWithFocus.exists).notOk();
    });

    test('#2 Fill out PAN & see that since binLookup does return a panLength maxLength is set on number SF and that focus moves to expiryDate', async () => {
        // await removeRequestHook(t);
        // await t.addRequestHooks(getMock('panLength'));
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
        // // Expect iframe to exist in number field with maxlength attr set to 19
        // await t
        //   .switchToIframe(cardPage.iframeSelector.nth(0))
        //   .expect(Selector('[data-fieldtype="encryptedCardNumber"]').getAttribute('maxlength'))
        //   .eql('19') // 4 blocks of 4 numbers with 3 spaces in between
        //   .switchToMainWindow();
        //
        // // Expect focus to be place on Expiry date field
        // await t.expect(cardPage.dateLabelWithFocus.exists).ok();
        //
        // // Then delete card number and see that the maxlength is rest on the iframe
        // await cardPage.cardUtils.deleteCardNumber(t);
        // await t
        //   .switchToIframe(cardPage.iframeSelector.nth(0))
        //   .expect(Selector('[data-fieldtype="encryptedCardNumber"]').getAttribute('maxlength'))
        //   .eql('24')
        //   .switchToMainWindow();
    });

    test('#3 Fill out PAN (binLookup w. panLength) see that focus moves to CVC since expiryDate is optional', async () => {
        //   await removeRequestHook(t);
        //   await t.addRequestHooks(getMock('optionalDate'));
        //
        //   // Wait for field to appear in DOM
        //   await cardPage.numHolder();
        //
        //   const firstDigits = REGULAR_TEST_CARD.substring(0, 15);
        //   const lastDigits = REGULAR_TEST_CARD.substring(15, 16);
        //
        //   await cardPage.cardUtils.fillCardNumber(t, firstDigits);
        //
        //   await t.wait(INPUT_DELAY);
        //
        //   await cardPage.cardUtils.fillCardNumber(t, lastDigits);
        //
        //   // Expect focus to be place on cvc field
        //   await t.expect(cardPage.cvcLabelWithFocus.exists).ok();
        // });
        //
        // test('#4 Fill out PAN (binLookup w. panLength) see that focus moves to CVC since expiryDate is hidden', async () => {
        //   await removeRequestHook(t);
        //   await t.addRequestHooks(getMock('hiddenDate'));
        //
        //   // Wait for field to appear in DOM
        //   await cardPage.numHolder();
        //
        //   const firstDigits = REGULAR_TEST_CARD.substring(0, 15);
        //   const lastDigits = REGULAR_TEST_CARD.substring(15, 16);
        //
        //   await cardPage.cardUtils.fillCardNumber(t, firstDigits);
        //
        //   await t.wait(INPUT_DELAY);
        //
        //   await cardPage.cardUtils.fillCardNumber(t, lastDigits);
        //
        //   // Expect focus to be place on cvc field
        //   await t.expect(cardPage.cvcLabelWithFocus.exists).ok();
    });

    test('#5 Fill out PAN (binLookup w. panLength) see that focus moves to holderName since expiryDate & cvc are optional', async () => {
        // await removeRequestHook(t);
        // await t.addRequestHooks(getMock('optionalDateAndCVC'));
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
        // // Expect focus to be place on name field
        // await t.expect(cardPage.holderNameLabelWithFocus.exists).ok();
    });

    test('#6 Fill out invalid date, then fill PAN (binLookup w. panLength) see that focus moves to expiryDate since expiryDate is in error', async () => {
        // await removeRequestHook(t);
        // await t.addRequestHooks(getMock('optionalDate'));
        //
        // // Wait for field to appear in DOM
        // await cardPage.numHolder();
        //
        // // Card out of date
        // await cardPage.cardUtils.fillDate(t, '12/90');
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
        // // Expect focus to be place on Expiry date field
        // await t.expect(cardPage.dateLabelWithFocus.exists).ok();
    });

    test('#7 Fill out PAN by pasting number (binLookup w. panLength) & see that maxLength is set on number SF and that focus moves to expiryDate', async () => {
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
