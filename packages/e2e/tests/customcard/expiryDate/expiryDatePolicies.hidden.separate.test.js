import { turnOffSDKMocking } from '../../_common/cardMocks';
import CustomCardComponentPage from '../../_models/CustomCardComponent.page';
import { SYNCHRONY_PLCC_NO_DATE, TEST_CVC_VALUE } from '../../cards/utils/constants';

const cardPage = new CustomCardComponentPage('.secured-fields-2');

const BASE_REF = 'securedFields2';

fixture`Test how Custom Card Component with separate date fields handles hidden expiryDate policy`
    .beforeEach(async t => {
        await t.navigateTo(cardPage.pageUrl);
        // For individual test suites (that rely on binLookup & perhaps are being run in isolation)
        // - provide a way to ensure SDK bin mocking is turned off
        await turnOffSDKMocking();
    })
    .clientScripts('./expiryDate.clientScripts.js');

test('#1 Testing hidden expiryDatePolicy - how UI & state respond', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Fill number to provoke binLookup response
    await cardPage.cardUtils.fillCardNumber(t, SYNCHRONY_PLCC_NO_DATE);

    // UI reflects that binLookup says expiryDate is hidden
    await t.expect(cardPage.monthHolder.filterHidden().exists).ok();
    await t.expect(cardPage.yearHolder.filterHidden().exists).ok();

    await cardPage.customCardUtils.fillCVC(t, TEST_CVC_VALUE);

    // Card seen as valid
    await t.expect(cardPage.getFromState(BASE_REF, 'isValid')).eql(true);

    // Clear number and see UI & state reset
    await cardPage.cardUtils.deleteCardNumber(t);
    await t
        .expect(cardPage.monthHolder.filterVisible().exists)
        .ok()
        .expect(cardPage.yearHolder.filterVisible().exists)
        .ok()
        .expect(cardPage.cvcHolder.filterVisible().exists)
        .ok()
        .expect(cardPage.getFromState(BASE_REF, 'isValid'))
        .eql(false);
});

test('#2 Testing hidden expiryDatePolicy - validating fields first and then entering PAN should see errors cleared from state', async t => {
    // Start, allow time for iframes to load so isValidated call to SF won't fail
    await t.wait(1000);

    // Click pay
    await t.click(cardPage.payButton);

    // Expect errors in UI
    await t
        .expect(cardPage.numErrorText.filterVisible().exists)
        .ok()
        .expect(cardPage.monthErrorText.filterVisible().exists)
        .ok()
        .expect(cardPage.yearErrorText.filterVisible().exists)
        .ok()
        .expect(cardPage.cvcErrorText.filterVisible().exists)
        .ok();

    // Expect errors in (mapped) state
    await t
        .expect(cardPage.getFromWindow('mappedStateErrors.encryptedExpiryMonth'))
        .notEql(null)
        .expect(cardPage.getFromWindow('mappedStateErrors.encryptedExpiryMonth'))
        .notEql(undefined)
        .expect(cardPage.getFromWindow('mappedStateErrors.encryptedExpiryYear'))
        .notEql(null)
        .expect(cardPage.getFromWindow('mappedStateErrors.encryptedSecurityCode'))
        .notEql(null);

    // Fill number to provoke binLookup response
    await cardPage.cardUtils.fillCardNumber(t, SYNCHRONY_PLCC_NO_DATE);

    // Expect errors to be cleared - since the fields were in error because they were empty
    // and now the PAN field is filled and the date & cvc fields are now hidden...

    // ...State errors cleared
    await t
        .expect(cardPage.getFromWindow('mappedStateErrors.encryptedExpiryMonth'))
        .eql(null)
        .expect(cardPage.getFromWindow('mappedStateErrors.encryptedExpiryYear'))
        .eql(null);
});

test('#3 Testing hidden expiryDatePolicy - date field in error does not stop card becoming valid', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Card out of date
    await cardPage.customCardUtils.fillMonth(t, '12');
    await cardPage.customCardUtils.fillYear(t, '90');

    // Expect errors in UI
    await t.expect(cardPage.yearErrorText.filterVisible().exists).ok();

    // Force blur event to fire on date field
    await cardPage.setForceClick(true);

    // Fill number to provoke binLookup response
    await cardPage.cardUtils.fillCardNumber(t, SYNCHRONY_PLCC_NO_DATE);

    // UI reflects that binLookup says expiryDate is hidden
    await t.expect(cardPage.monthHolder.filterHidden().exists).ok();
    await t.expect(cardPage.yearHolder.filterHidden().exists).ok();

    await cardPage.customCardUtils.fillCVC(t, TEST_CVC_VALUE);

    // Card seen as valid (despite date field technically being in error)
    await t.expect(cardPage.getFromState(BASE_REF, 'isValid')).eql(true);

    // Expect errors in (mapped) state to remain
    await t.expect(cardPage.getFromWindow('mappedStateErrors.encryptedExpiryYear')).notEql(null);

    // Delete number
    await cardPage.cardUtils.deleteCardNumber(t);

    // Errors in UI visible again
    await t.expect(cardPage.yearErrorText.filterVisible().exists).ok();

    // Card is not valid
    await t.expect(cardPage.getFromState(BASE_REF, 'isValid')).eql(false);
});
