import { binLookupUrl, getBinLookupMock, turnOffSDKMocking } from '../../_common/cardMocks';
import CustomCardComponentPage from '../../_models/CustomCardComponent.page';
import { REGULAR_TEST_CARD } from '../../cards/utils/constants';

const cardPage = new CustomCardComponentPage();

const BASE_REF = 'securedFields';

/**
 * NOTE - we are mocking the response until such time as we have a genuine card,
 * that's not in our local RegEx, that returns the properties we want to test
 */
const mockedResponse = {
    brands: [
        {
            brand: 'cup', // keep as a recognised card brand (cup) until we have a genuine brand w. optional expiryDate
            cvcPolicy: 'optional',
            enableLuhnCheck: true,
            expiryDatePolicy: 'optional',
            supported: true
        }
    ],
    issuingCountryCode: 'US',
    requestId: null
};

const mock = getBinLookupMock(binLookupUrl, mockedResponse);

fixture`Test how regular Custom Card Component handles optional expiryDate policy`
    .beforeEach(async t => {
        await t.navigateTo(cardPage.pageUrl);
        // For individual test suites (that rely on binLookup & perhaps are being run in isolation)
        // - provide a way to ensure SDK bin mocking is turned off
        await turnOffSDKMocking();
    })
    .requestHooks(mock)
    .clientScripts('./expiryDate.clientScripts.js');

test('#1 Testing optional expiryDatePolicy - how UI & state respond', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Regular date label
    await t.expect(cardPage.dateLabelText.withText('(optional)').exists).notOk();

    // Fill number to provoke (mock) binLookup response
    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    // UI reflects that binLookup says expiryDate is optional
    await t.expect(cardPage.dateLabelText.withText('(optional)').exists).ok();

    // ...and cvc is optional too
    await t.expect(cardPage.cvcLabelText.withText('(optional)').exists).ok();

    // Card seen as valid (since CVC is optional too)
    await t.expect(cardPage.getFromState(BASE_REF, 'isValid')).eql(true);

    // Clear number and see UI & state reset
    await cardPage.cardUtils.deleteCardNumber(t);
    await t
        .expect(cardPage.dateLabelText.withText('(optional)').exists)
        .notOk()
        .expect(cardPage.cvcLabelText.withText('(optional)').exists)
        .notOk()
        .expect(cardPage.getFromState(BASE_REF, 'isValid'))
        .eql(false);
});

test('#2 Testing optional expiryDatePolicy, in regular Custom Card - how securedField responds', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Expect iframe to exist in expiryDate field with aria-required attr set to true
    await cardPage.cardUtils.checkIframeForAttrVal(t, 1, 'encryptedExpiryDate', 'aria-required', 'true');

    // Fill number to provoke (mock) binLookup response
    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    // Expect iframe to exist in expiryDate field and with aria-required attr set to false
    await cardPage.cardUtils.checkIframeForAttrVal(t, 1, 'encryptedExpiryDate', 'aria-required', 'false');

    // Clear number and see SF's aria-required reset
    await cardPage.cardUtils.deleteCardNumber(t);

    await cardPage.cardUtils.checkIframeForAttrVal(t, 1, 'encryptedExpiryDate', 'aria-required', 'true');
});

test('#3 Testing optional expiryDatePolicy - validating fields first and then entering PAN should see errors cleared from both UI & state', async t => {
    // Start, allow time for iframes to load so isValidated call to SF won't fail
    await t.wait(1000);

    // Click pay
    await t.click(cardPage.payButton);

    // Expect errors in UI
    await t
        .expect(cardPage.numErrorText.filterVisible().exists)
        .ok()
        .expect(cardPage.dateErrorText.filterVisible().exists)
        .ok()
        .expect(cardPage.cvcErrorText.filterVisible().exists)
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
    // and now the PAN field is filled and the date & cvc fields are now optional...

    // ...UI errors cleared...
    await t
        .expect(cardPage.numErrorText.filterHidden().exists)
        .ok()
        .expect(cardPage.dateErrorText.filterHidden().exists)
        .ok()
        .expect(cardPage.cvcErrorText.filterHidden().exists)
        .ok();

    // ...State errors cleared
    await t
        .expect(cardPage.getFromWindow('mappedStateErrors.encryptedExpiryDate'))
        .eql(null)
        .expect(cardPage.getFromWindow('mappedStateErrors.encryptedSecurityCode'))
        .eql(null);
});

test('#4 Testing optional expiryDatePolicy - date field in error DOES stop card becoming valid', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Card out of date
    await cardPage.cardUtils.fillDate(t, '12/90');

    // Expect errors in UI
    await t.expect(cardPage.dateErrorText.filterVisible().exists).ok();

    // Force blur event to fire on date field
    await cardPage.setForceClick(true);

    // Fill number to provoke (mock) binLookup response
    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    // UI reflects that binLookup says expiryDate is optional
    await t.expect(cardPage.dateLabelText.withText('(optional)').exists).ok();

    // Visual errors persist in UI
    await t.expect(cardPage.dateErrorText.filterVisible().exists).ok();

    // Card not seen as valid
    await t.expect(cardPage.getFromState(BASE_REF, 'isValid')).eql(false);

    // Delete erroneous date
    await cardPage.cardUtils.deleteDate(t);

    // Card is now valid
    await t.expect(cardPage.getFromState(BASE_REF, 'isValid')).eql(true);
});
