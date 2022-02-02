import { binLookupUrl, getBinLookupMock, turnOffSDKMocking } from '../../../../_common/cardMocks';
import CardComponentPage from '../../../../_models/CardComponent.page';
import { REGULAR_TEST_CARD } from '../../../utils/constants';
import { Selector } from 'testcafe';
import { mocks } from './mocks';

const cardPage = new CardComponentPage();

const INPUT_DELAY = 100;

/**
 * NOTE - we are mocking the response until such time as we have a genuine card that returns the properties we want to test
 */

let currentMock = null;

const getMock = val => {
    const mock = mocks[val];
    currentMock = getBinLookupMock(binLookupUrl, mock);
    return currentMock;
};

const removeRequestHook = async t => {
    if (currentMock) await t.removeRequestHooks(currentMock); // don't know if this is strictly necessary
};

fixture`Test how Card Component handles binLookup returning a panLength property (or not)`
    .beforeEach(async t => {
        await t.navigateTo(cardPage.pageUrl);
        // For individual test suites (that rely on binLookup & perhaps are being run in isolation)
        // - provide a way to ensure SDK bin mocking is turned off
        await turnOffSDKMocking();
    })
    .clientScripts('./panLength.regular.clientScripts.js');

test("#1 Fill out PAN & see that focus stays on number field since binLookup doesn't return a panLength", async t => {
    await t.addRequestHooks(getMock('noPanLength'));

    // Wait for field to appear in DOM
    await cardPage.numHolder();

    const firstDigits = REGULAR_TEST_CARD.substring(0, 15);
    const lastDigits = REGULAR_TEST_CARD.substring(15, 16);

    await cardPage.cardUtils.fillCardNumber(t, firstDigits);

    await t.wait(INPUT_DELAY);

    await cardPage.cardUtils.fillCardNumber(t, lastDigits);

    // Expect focus to be still be on number field
    await t.expect(cardPage.numLabelWithFocus.exists).ok();
    await t.expect(cardPage.dateLabelWithFocus.exists).notOk();
});

test('#2 Fill out PAN & see that since binLookup does return a panLength maxLength is set on number SF and that focus moves to expiryDate', async t => {
    await removeRequestHook(t);
    await t.addRequestHooks(getMock('panLength'));

    // Wait for field to appear in DOM
    await cardPage.numHolder();

    const firstDigits = REGULAR_TEST_CARD.substring(0, 15);
    const lastDigits = REGULAR_TEST_CARD.substring(15, 16);

    await cardPage.cardUtils.fillCardNumber(t, firstDigits);

    await t.wait(INPUT_DELAY);

    await cardPage.cardUtils.fillCardNumber(t, lastDigits);

    // Expect iframe to exist in number field with maxlength attr set to 19
    await t
        .switchToIframe(cardPage.iframeSelector.nth(0))
        .expect(Selector('[data-fieldtype="encryptedCardNumber"]').getAttribute('maxlength'))
        //        .eql('19')// 4 blocks of 4 numbers with 3 spaces in between // TODO comment in once sf 3.9.0 is available
        .eql('24') // TODO comment out once sf 3.9.0 is available
        .switchToMainWindow();

    // Expect focus to be place on Expiry date field
    await t.expect(cardPage.dateLabelWithFocus.exists).ok();
}); //.requestHooks(getNextMock());

test('#3 Fill out PAN & see that since binLookup does return a panLength focus moves to CVC since expiryDate is optional', async t => {
    await removeRequestHook(t);
    await t.addRequestHooks(getMock('optionalDate'));

    // Wait for field to appear in DOM
    await cardPage.numHolder();

    const firstDigits = REGULAR_TEST_CARD.substring(0, 15);
    const lastDigits = REGULAR_TEST_CARD.substring(15, 16);

    await cardPage.cardUtils.fillCardNumber(t, firstDigits);

    await t.wait(INPUT_DELAY);

    await cardPage.cardUtils.fillCardNumber(t, lastDigits);

    // Expect focus to be place on cvc field
    await t.expect(cardPage.cvcLabelWithFocus.exists).ok();
});

test('#4 Fill out PAN & see that since binLookup does return a panLength focus moves to CVC since expiryDate is hidden', async t => {
    await removeRequestHook(t);
    await t.addRequestHooks(getMock('hiddenDate'));

    // Wait for field to appear in DOM
    await cardPage.numHolder();

    const firstDigits = REGULAR_TEST_CARD.substring(0, 15);
    const lastDigits = REGULAR_TEST_CARD.substring(15, 16);

    await cardPage.cardUtils.fillCardNumber(t, firstDigits);

    await t.wait(INPUT_DELAY);

    await cardPage.cardUtils.fillCardNumber(t, lastDigits);

    // Expect focus to be place on cvc field
    await t.expect(cardPage.cvcLabelWithFocus.exists).ok();
});

test('#5 Fill out PAN & see that since binLookup does return a panLength focus moves to holderName since expiryDate & cvc are optional', async t => {
    await removeRequestHook(t);
    await t.addRequestHooks(getMock('optionalDateAndCVC'));

    // Wait for field to appear in DOM
    await cardPage.numHolder();

    const firstDigits = REGULAR_TEST_CARD.substring(0, 15);
    const lastDigits = REGULAR_TEST_CARD.substring(15, 16);

    await cardPage.cardUtils.fillCardNumber(t, firstDigits);

    await t.wait(INPUT_DELAY);

    await cardPage.cardUtils.fillCardNumber(t, lastDigits);

    // Expect focus to be place on name field
    await t.expect(cardPage.holderNameLabelWithFocus.exists).ok();
});

test('#6 Fill out invalid date, then fill PAN & see that since binLookup does return a panLength focus moves to expiryDate since expiryDate is in error', async t => {
    await removeRequestHook(t);
    await t.addRequestHooks(getMock('optionalDate'));

    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Card out of date
    await cardPage.cardUtils.fillDate(t, '12/90');

    const firstDigits = REGULAR_TEST_CARD.substring(0, 15);
    const lastDigits = REGULAR_TEST_CARD.substring(15, 16);

    await cardPage.cardUtils.fillCardNumber(t, firstDigits);

    await t.wait(INPUT_DELAY);

    await cardPage.cardUtils.fillCardNumber(t, lastDigits);

    // Expect focus to be place on Expiry date field
    await t.expect(cardPage.dateLabelWithFocus.exists).ok();
});

test('#7 Fill out PAN by pasting number & see that maxLength is set on number SF and that focus moves to expiryDate', async t => {
    await removeRequestHook(t);
    await t.addRequestHooks(getMock('panLength'));

    // Wait for field to appear in DOM
    await cardPage.numHolder();

    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD, 'paste');

    // Expect iframe to exist in number field with maxlength attr set to 19
    await t
        .switchToIframe(cardPage.iframeSelector.nth(0))
        .expect(Selector('[data-fieldtype="encryptedCardNumber"]').getAttribute('maxlength'))
        //        .eql('19')// 4 blocks of 4 numbers with 3 spaces in between // TODO comment in once sf 3.9.0 is available
        .eql('24') // TODO comment out once sf 3.9.0 is available
        .switchToMainWindow();

    // Expect focus to be place on Expiry date field
    await t.expect(cardPage.dateLabelWithFocus.exists).ok();
});
