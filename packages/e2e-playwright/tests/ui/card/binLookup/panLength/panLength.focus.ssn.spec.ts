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

test.describe('Test how Card Component handles binLookup returning a panLength property for a card with a social security number', () => {
    test.beforeEach(async () => {
        // use config from panLength.ssn.clientScripts.js
        //await t.navigateTo(cardPage);
        // For individual test suites (that rely on binLookup & perhaps are being run in isolation)
        // - provide a way to ensure SDK bin mocking is turned off
        await turnOffSDKMocking();
    });

    test('#1 Fill out PAN (binLookup w. panLength) see that focus moves to social security number since expiryDate & cvc are optional', async t => {
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
        // // Expect focus to be place on ssn field
        // await t.expect(cardPage.ssnLabelWithFocus.exists).ok();
    });
});
