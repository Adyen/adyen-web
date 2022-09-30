import { TEST_CVC_VALUE } from '../cards/utils/constants';
import CardComponentPage from '../_models/CardComponent.page';
import LANG from '../../../lib/src/language/locales/en-US.json';

const cardPage = new CardComponentPage('.stored-card-field', {}, 'storedcards');

const ARIA_LABEL = LANG['creditCard.encryptedSecurityCode.aria.label'];
const INCOMPLETE_FIELD = LANG['error.va.gen.01'];

// KEEP for changes in upcoming version
// const EMPTY_FIELD = LANG['error.va.sf-cc-cvc.01'];
// const INCORRECTLY_FILLED_FIELD = LANG['error.va.sf-cc-cvc.02'];

fixture`Testing some general functionality and UI on the stored card component`.beforeEach(async t => {
    await t.navigateTo(cardPage.pageUrl);
});

test('#1 Can fill out the cvc fields in the stored card and make a successful payment', async t => {
    // Wait for field to appear in DOM
    await cardPage.cvcHolder();

    // handler for alert that's triggered on successful payment
    await t.setNativeDialogHandler(() => true);

    await cardPage.cardUtils.fillCVC(t, TEST_CVC_VALUE, 'add', 0);

    // click pay
    await t
        .click(cardPage.payButton)
        .expect(cardPage.cvcLabelTextError.exists)
        .notOk()
        .wait(1000);

    // Check the value of the alert text
    const history = await t.getNativeDialogHistory();
    await t.expect(history[0].text).eql('Authorised');
});

test('#2 Pressing pay without filling the cvc should generate a translated error', async t => {
    // Wait for field to appear in DOM
    await cardPage.cvcHolder();

    // click pay
    await t
        .click(cardPage.payButton)
        .expect(cardPage.cvcLabelTextError.exists)
        .ok()
        // with text
        .expect(cardPage.cvcErrorText.withExactText(`${ARIA_LABEL}: ${INCOMPLETE_FIELD}`).exists)
        .ok();
});

test("#3 Value of label's 'for' attr should match value of corresponding securedField input's 'id' attr", async t => {
    // Wait for field to appear in DOM
    await cardPage.cvcHolder();

    const cvcAttrVal = await cardPage.cvcLabel.getAttribute('for');
    await cardPage.cardUtils.checkIframeForAttrVal(t, 0, 'encryptedSecurityCode', 'id', cvcAttrVal);
});
