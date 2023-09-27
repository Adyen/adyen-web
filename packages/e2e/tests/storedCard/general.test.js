import { TEST_CVC_VALUE } from '../cards/utils/constants';
import CardComponentPage from '../_models/CardComponent.page';
import LANG from '../../../lib/src/language/locales/en-US.json';

const cardPage = new CardComponentPage('.stored-card-field', {}, 'storedcards');

const EMPTY_FIELD = LANG['error.va.sf-cc-cvc.01'];

fixture`Testing some general functionality and UI on the stored card component`.beforeEach(async t => {
    await t.navigateTo(cardPage.pageUrl);
});

test('#1 Can fill out the cvc fields in the stored card and make a successful payment', async t => {
    // Wait for field to appear in DOM
    await cardPage.cvcHolder();

    // handler for alert that's triggered on successful payment
    await t.setNativeDialogHandler(() => true);

    // expiry date field is readonly
    await t.expect(cardPage.storedCardExpiryDate.withAttribute('disabled').exists).ok();

    await cardPage.cardUtils.fillCVC(t, TEST_CVC_VALUE, 'add', 0);

    // click pay
    await t.click(cardPage.payButton).expect(cardPage.cvcLabelTextError.exists).notOk().wait(1000);

    // Check the value of the alert text
    const history = await t.getNativeDialogHistory();
    await t.expect(history[0].text).eql('Authorised');
});

test('#2 Pressing pay without filling the cvc should generate a translated error ("empty")', async t => {
    // Wait for field to appear in DOM
    await cardPage.cvcHolder();

    // click pay
    await t
        .click(cardPage.payButton)
        .expect(cardPage.cvcLabelTextError.exists)
        .ok()
        // with text
        .expect(cardPage.cvcErrorText.withExactText(EMPTY_FIELD).exists)
        .ok();
});

test('#3 A storedCard with no expiry date field still can be used for a successful payment', async t => {
    // Wait for field to appear in DOM
    await cardPage.cvcHolder();

    // handler for alert that's triggered on successful payment
    await t.setNativeDialogHandler(() => true);

    // expiry date field is not visible
    await t.expect(cardPage.storedCardExpiryDate.exists).notOk();

    await cardPage.cardUtils.fillCVC(t, TEST_CVC_VALUE, 'add', 0);

    // click pay
    await t.click(cardPage.payButton).expect(cardPage.cvcLabelTextError.exists).notOk().wait(1000);

    // Check the value of the alert text
    const history = await t.getNativeDialogHistory();
    await t.expect(history[0].text).eql('Authorised');
}).clientScripts('./storedCard.noExpiry.clientScripts.js'); // N.B. the clientScript nullifies the expiryMonth & Year fields in the storedCardData
