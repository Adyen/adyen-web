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

test.describe('Test how Card Component handles binLookup returning a panLength property for a card with a KCP fields', () => {
    test.beforeEach(async () => {
        // use config from panLength.kcp.clientScripts.js
        // await t.navigateTo(cardPage);
        // For individual test suites (that rely on binLookup & perhaps are being run in isolation)
        // - provide a way to ensure SDK bin mocking is turned off
        await turnOffSDKMocking();
    });

    test('#1 Fill out PAN (binLookup w. panLength) see that focus moves to tax number since expiryDate & cvc are optional', async () => {
        // await t.addRequestHooks(getMock('kcpMock'));
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
        // // Expect focus to be place on tax number field
        // await t.expect(cardPage.kcpTaxNumberLabelWithFocus.exists).ok();
    });

    test('#2 Paste non KCP PAN and see focus move to date field', async () => {
        // await t.addRequestHooks(getMock('visaMock'));
        //
        // // Wait for field to appear in DOM
        // await cardPage.numHolder();
        //
        // await t.wait(1000);
        //
        // await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD, 'paste');
        //
        // // Expect focus to be place on date field
        // await t.expect(cardPage.dateLabelWithFocus.exists).ok();
    });
});
