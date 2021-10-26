import CardComponentPage from '../../_models/CardComponent.page';

import { REGULAR_TEST_CARD } from '../utils/constants';

const cardPage = new CardComponentPage();

/**
 * NOTE - we are mocking the response until such time as we have a genuine card,
 * that's not in our local RegEx, that returns the properties we want to test
 */
const mockedResponse = {
    brands: [
        {
            brand: 'cup', // keep as a recognised card brand (cup) until we have a genuine brand w. hidden expiryDate
            cvcPolicy: 'hidden',
            enableLuhnCheck: true,
            expiryDatePolicy: 'hidden',
            supported: true
        }
    ],
    issuingCountryCode: 'US',
    requestId: null
};

const mock = cardPage.getMock(cardPage.binLookupUrl, mockedResponse);

fixture`Test how Card Component handles hidden expiryDate policy`
    .clientScripts('expiryDate.clientScripts.js')
    .requestHooks(mock)
    .beforeEach(async t => {
        await t.navigateTo(cardPage.pageUrl);
        await cardPage.turnOffSDKMocking();
    });

test('#1 Testing hidden expiryDatePolicy - how UI & state respond', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Fill number to provoke (mock) binLookup response
    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    // UI reflects that binLookup says expiryDate is hidden
    await t.expect(cardPage.dateHolder.filterHidden().exists).ok();

    // ...and cvc is hidden too
    await t.expect(cardPage.cvcHolder.filterHidden().exists).ok();

    // Card seen as valid (since CVC is optional too)
    await t.expect(cardPage.getFromState('isValid')).eql(true);

    // Clear number and see UI & state reset
    await cardPage.cardUtils.deleteCardNumber(t);
    await t
        .expect(cardPage.dateHolder.filterVisible().exists)
        .ok()
        .expect(cardPage.cvcHolder.filterVisible().exists)
        .ok()
        .expect(cardPage.getFromState('isValid'))
        .eql(false);
});

test('#2 Testing hidden expiryDatePolicy - date field in error does not stop card becoming valid', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Card out of date
    await cardPage.cardUtils.fillDate(t, '12/90');

    // Expect errors in UI
    await t.expect(cardPage.dateLabelTextError.exists).ok();

    // Force blur event to fire on date field
    await cardPage.setForceClick(true);

    // Fill number to provoke (mock) binLookup response
    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    // UI reflects that binLookup says expiryDate is hidden
    await t.expect(cardPage.dateHolder.filterHidden().exists).ok();

    // Card seen as valid (despite date field technically being in error)
    await t.expect(cardPage.getFromState('isValid')).eql(true);

    // Delete number
    await cardPage.cardUtils.deleteCardNumber(t);

    // Errors in UI visible again
    await t.expect(cardPage.dateLabelTextError.exists).ok();
});
