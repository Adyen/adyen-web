import { Selector } from 'testcafe';
import { start, getIframeSelector } from '../../utils/commonUtils';
import { CARDS_URL } from '../../pages';

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.card-field iframe');

fixture`Testing setting legacyInputMode`.page(CARDS_URL).clientScripts('legacyInputMode.clientScripts.js');

test('Set legacyInputMode and expect all securedFields to have inputs with type="tel"', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Expect CardNumber field to have input type 'tel'
    await t
        .switchToIframe(iframeSelector.nth(0))
        .expect(Selector('#encryptedCardNumber').getAttribute('type'))
        .eql('tel')
        .switchToMainWindow();

    // Expect ExpiryDate field to have input type 'tel'
    await t
        .switchToIframe(iframeSelector.nth(1))
        .expect(Selector('#encryptedExpiryDate').getAttribute('type'))
        .eql('tel')
        .switchToMainWindow();

    // Expect CVC field to have input type 'tel'
    await t
        .switchToIframe(iframeSelector.nth(2))
        .expect(Selector('#encryptedSecurityCode').getAttribute('type'))
        .eql('tel')
        .switchToMainWindow();
});
