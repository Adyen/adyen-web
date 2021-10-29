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
    .beforeEach(async t => {
        await t.navigateTo(cardPage.pageUrl);
        await cardPage.turnOffSDKMocking();
    })
    .requestHooks(mock)
    .clientScripts('./expiryDate.clientScripts.js');

test('#1 Testing hidden expiryDatePolicy - how UI & state respond', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Fill number to provoke (mock) binLookup response
    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    // UI reflects that binLookup says expiryDate is hidden
    await t.expect(cardPage.dateHolder.filterHidden().exists).ok();

    // ...and cvc is hidden too
    await t.expect(cardPage.cvcHolder.filterHidden().exists).ok();

    // Card seen as valid (since CVC is hidden too)
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

test('#2 Testing hidden expiryDatePolicy - validating fields first and then entering PAN should see errors cleared from state', async t => {
    // Start, allow time for iframes to load so isValidated call to SF won't fail
    await t.wait(1000);

    // Click pay
    await t.click(cardPage.payButton);

    // Expect errors in UI
    await t
        .expect(cardPage.numLabelTextError.exists)
        .ok()
        .expect(cardPage.dateLabelTextError.exists)
        .ok()
        .expect(cardPage.cvcLabelTextError.exists)
        .ok();

    // Expect errors in (mapped) state
    await t
        .expect(cardPage.getFromWindow('mappedStateErrors.encryptedExpiryDate'))
        .notEql(null)
        .expect(cardPage.getFromWindow('mappedStateErrors.encryptedExpiryDate'))
        .notEql(undefined)
        .expect(cardPage.getFromWindow('mappedStateErrors.encryptedSecurityCode'))
        .notEql(null);

    // Fill number to provoke (mock) binLookup response
    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    // Expect errors to be cleared - since the fields were in error because they were empty
    // and now the PAN field is filled and the date & cvc fields are now hidden...

    // ...State errors cleared
    await t
        .expect(cardPage.getFromWindow('mappedStateErrors.encryptedExpiryDate'))
        .eql(null)
        .expect(cardPage.getFromWindow('mappedStateErrors.encryptedSecurityCode'))
        .eql(null);
});

test('#3 Testing hidden expiryDatePolicy - date field in error does not stop card becoming valid', async t => {
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

    // Expect errors in (mapped) state to remain
    await t.expect(cardPage.getFromWindow('mappedStateErrors.encryptedExpiryDate')).notEql(null);

    // Delete number
    await cardPage.cardUtils.deleteCardNumber(t);

    // Errors in UI visible again
    await t.expect(cardPage.dateLabelTextError.exists).ok();

    // Card is not valid
    await t.expect(cardPage.getFromState('isValid')).eql(false);
});
