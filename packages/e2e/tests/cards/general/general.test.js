import { REGULAR_TEST_CARD } from '../utils/constants';
import CardComponentPage from '../../_models/CardComponent.page';

const cardPage = new CardComponentPage();

fixture`Testing some general functionality and UI on the regular card component`.beforeEach(async t => {
    await t.navigateTo(cardPage.pageUrl);
});

test('#1 Can fill out the fields in the regular card and make a successful payment', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // handler for alert that's triggered on successful payment
    await t.setNativeDialogHandler(() => true);

    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    await cardPage.cardUtils.fillDateAndCVC(t);

    // click pay
    await t
        .click(cardPage.payButton)
        // no visible errors
        .expect(cardPage.numLabelTextError.exists)
        .notOk()
        .expect(cardPage.dateLabelTextError.exists)
        .notOk()
        .expect(cardPage.cvcLabelTextError.exists)
        .notOk()
        .wait(1000);

    // Check the value of the alert text
    const history = await t.getNativeDialogHistory();
    await t.expect(history[0].text).eql('Authorised');
});

test("#2 Value of label's 'for' attr should match value of corresponding securedField input's 'id' attr", async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    const numAttrVal = await cardPage.numLabel.getAttribute('for');
    await cardPage.cardUtils.checkIframeForAttrVal(t, 0, 'encryptedCardNumber', 'id', numAttrVal);

    const dateAttrVal = await cardPage.dateLabel.getAttribute('for');
    await cardPage.cardUtils.checkIframeForAttrVal(t, 1, 'encryptedExpiryDate', 'id', dateAttrVal);

    const cvcAttrVal = await cardPage.cvcLabel.getAttribute('for');
    await cardPage.cardUtils.checkIframeForAttrVal(t, 2, 'encryptedSecurityCode', 'id', cvcAttrVal);

    // KEEP AS REF - process needed if we actually want to be able to store or log the value of an attr on an iframe
    //    await t.switchToMainWindow().switchToIframe(cardPage.iframeSelector.nth(0));
    //    const idVal = await Selector(getInputSelector('encryptedCardNumber')).getAttribute('id');
    //    console.log('### general.test:::: idVal', idVal);
    //    await t.switchToMainWindow();
    //    await t.expect(numAttrVal).eql(idVal);
});

test('#3 PAN that consists of the same digit (but passes luhn) causes an error', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    await cardPage.cardUtils.fillCardNumber(t, '3333 3333 3333 3333 3333');

    await cardPage.setForceClick(true);

    // Click label text to force the blur event on the card field
    await t
        .click(cardPage.dateLabelText)
        // visible error
        .expect(cardPage.numLabelTextError.exists)
        .ok();
});
