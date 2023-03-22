import CardComponentPage from '../../_models/CardComponent.page';
import { getInputSelector } from '../../utils/commonUtils';

const cardPage = new CardComponentPage();

fixture`Testing when error panel is not enabled`
    .beforeEach(async t => {
        await t.navigateTo(cardPage.pageUrl);
    })
    .clientScripts('./errorPanel.disabled.avsCard.clientScripts.js');

test('#1 avsCard error fields and inputs should have correct aria attributes', async t => {
    // error panel does not exist at startup
    await t.expect(cardPage.errorPanelVisible.exists).notOk();

    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // click pay, to validate & generate errors
    await t.click(cardPage.payButton);

    // PAN's error field should have correct aria attrs
    await t.expect(cardPage.numErrorText.getAttribute('aria-live')).eql(null).expect(cardPage.numErrorText.getAttribute('aria-hidden')).eql('true');

    // PAN input should have aria-describedby attr
    await t.switchToMainWindow().switchToIframe(cardPage.iframeSelector.nth(0));
    const adb = await getInputSelector('encryptedCardNumber', true).getAttribute('aria-describedby');
    await t.expect(adb).notEql(null).expect(adb).contains('encryptedCardNumber');
    await t.switchToMainWindow();

    // Address input's error field should have correct aria attrs
    await t
        .expect(cardPage.addressLabelErrorText.getAttribute('aria-live'))
        .eql(null)
        .expect(cardPage.addressLabelErrorText.getAttribute('aria-hidden'))
        .eql(null);

    // Address should have aria-describedby attr & it should equals the error field's id
    await t.expect(cardPage.addressInput.getAttribute('aria-describedby')).notEql(null);

    const addressErrorTextId = await cardPage.addressLabelErrorText.getAttribute('id');
    await t.expect(cardPage.addressInput.getAttribute('aria-describedby')).eql(addressErrorTextId);
});
