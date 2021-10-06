import { Selector } from 'testcafe';
import { start, getIframeSelector } from '../../utils/commonUtils';
import { CARDS_URL } from '../../pages';

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.card-field iframe');

fixture`Testing not setting legacyInputMode`.page(CARDS_URL).clientScripts('noLegacyInputMode.clientScripts.js');

test('Do not set legacyInputMode and expect all securedFields to have inputs with type="text" & inputmode="numeric"', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Expect CardNumber field to have input type="text" & inputmode="numeric"
    await t
        .switchToIframe(iframeSelector.nth(0))
        .expect(Selector('[data-fieldtype="encryptedCardNumber"').getAttribute('type'))
        .eql('text')
        .expect(Selector('[data-fieldtype="encryptedCardNumber"').getAttribute('inputmode'))
        .eql('numeric')
        .switchToMainWindow();

    // Expect ExpiryDate field to have input type type="text" & inputmode="numeric"
    await t
        .switchToIframe(iframeSelector.nth(1))
        .expect(Selector('[data-fieldtype="encryptedExpiryDate"').getAttribute('type'))
        .eql('text')
        .expect(Selector('[data-fieldtype="encryptedExpiryDate"').getAttribute('inputmode'))
        .eql('numeric')
        .switchToMainWindow();

    // Expect CVC field to have input type type="text" & inputmode="numeric"
    await t
        .switchToIframe(iframeSelector.nth(2))
        .expect(Selector('[data-fieldtype="encryptedSecurityCode"').getAttribute('type'))
        .eql('text')
        .expect(Selector('[data-fieldtype="encryptedSecurityCode"').getAttribute('inputmode'))
        .eql('numeric')
        .switchToMainWindow();
});
