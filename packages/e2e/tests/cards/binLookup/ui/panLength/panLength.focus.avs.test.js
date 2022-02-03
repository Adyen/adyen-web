import { binLookupUrl, getBinLookupMock, turnOffSDKMocking } from '../../../../_common/cardMocks';
import CardComponentPage from '../../../../_models/CardComponent.page';
import { REGULAR_TEST_CARD } from '../../../utils/constants';
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

fixture`Test how Card Component handles binLookup returning a panLength property for a card with address fields`
    .beforeEach(async t => {
        await t.navigateTo(cardPage.pageUrl);
        // For individual test suites (that rely on binLookup & perhaps are being run in isolation)
        // - provide a way to ensure SDK bin mocking is turned off
        await turnOffSDKMocking();
    })
    .clientScripts('./panLength.avs.clientScripts.js');

test('#1 Fill out PAN (binLookup w. panLength) see that focus moves to an address field since expiryDate & cvc are optional', async t => {
    await t.addRequestHooks(getMock('optionalDateAndCVC'));

    // Wait for field to appear in DOM
    await cardPage.numHolder();

    const firstDigits = REGULAR_TEST_CARD.substring(0, 15);
    const lastDigits = REGULAR_TEST_CARD.substring(15, 16);

    await cardPage.cardUtils.fillCardNumber(t, firstDigits);

    await t.wait(INPUT_DELAY);

    await cardPage.cardUtils.fillCardNumber(t, lastDigits);

    // Expect focus to be place on address (street) field
    await t.expect(cardPage.addressLabelWithFocus.exists).ok();
});
