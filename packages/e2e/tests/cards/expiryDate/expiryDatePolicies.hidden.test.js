import CardComponentPage from '../../_models/CardComponent.page';
import { SYNCHRONY_PLCC_NO_DATE, TEST_CVC_VALUE } from '../utils/constants';
import { turnOffSDKMocking } from '../../_common/cardMocks';

const cardPage = new CardComponentPage();

fixture`Test how Card Component handles hidden expiryDate policy`
    .beforeEach(async t => {
        await t.navigateTo(cardPage.pageUrl);
        await turnOffSDKMocking();
    })
    .clientScripts('./expiryDate.clientScripts.js');

test('#1 Testing hidden expiryDatePolicy - how UI & state respond', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Fill number to provoke binLookup response
    await cardPage.cardUtils.fillCardNumber(t, SYNCHRONY_PLCC_NO_DATE);

    // UI reflects that binLookup says expiryDate is hidden
    await t.expect(cardPage.dateHolder.filterHidden().exists).ok();

    // Card seen as invalid
    await t.expect(cardPage.getFromState('isValid')).eql(false);

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

    // Fill number to provoke binLookup response
    await cardPage.cardUtils.fillCardNumber(t, SYNCHRONY_PLCC_NO_DATE, 'paste'); // TODO - shouldn't have to 'paste' here... but Testcafe is being flaky, again!

    // Expect errors to be cleared - since the fields were in error because they were empty
    // and now the PAN field is filled and the date fields is now hidden...

    // ...State errors cleared for date
    await t.expect(cardPage.getFromWindow('mappedStateErrors.encryptedExpiryDate')).eql(null);
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

    // Fill number to provoke binLookup response
    await cardPage.cardUtils.fillCardNumber(t, SYNCHRONY_PLCC_NO_DATE);
    await cardPage.cardUtils.fillCVC(t, TEST_CVC_VALUE);

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
