import { Selector, ClientFunction } from 'testcafe';
import { start, getIframeSelector } from '../../utils/commonUtils';
import cu from '../../cards/utils/cardUtils';
import { REGULAR_TEST_CARD, MAESTRO_CARD } from '../../cards/utils/constants';
import { CUSTOMCARDS_URL } from '../../pages';
import LANG from '../../../../lib/src/language/locales/en-US.json';

const errorLabel = Selector('.secured-fields .pm-form-label__error-text');

const UNSUPPORTED_CARD = LANG['error.va.sf-cc-num.03'];

const getSFState = ClientFunction((what, prop) => {
    return window.securedFields.state[what][prop];
});

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.secured-fields iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing persistence of "Unsupported card" error and state at both component & securedField level`
    .page(CUSTOMCARDS_URL)
    .clientScripts('customcard.unsupportedCard.clientScripts.js');

test(
    'Enter partial card number that is not supported then ' +
        'check resulting error is processed correctly at merchant and SF level then ' +
        'add digits to number and check error states persist then ' +
        ' complete number to make it "valid" (right length, passes luhn then ' +
        'check error states persist then ' +
        'delete number & check error state clear then ' +
        'add supported number and check field is seen as valid at merchant and SF levels',
    async t => {
        // Start, allow time to load
        await start(t, 2000, TEST_SPEED);

        // Hidden error field
        await t.expect(errorLabel.filterHidden().exists).ok();

        /**
         * Add partial number
         */
        await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD.substr(0, 11));

        // Merchant/components level error field visible & text set
        await t
            .expect(errorLabel.filterVisible().exists)
            .ok()
            .expect(errorLabel.withExactText(UNSUPPORTED_CARD).exists)
            .ok();

        // Error received & processed at SF level
        await t
            .switchToIframe(iframeSelector.nth(0))
            // Expect input in iframe to have aria-invalid set to true
            .expect(Selector('#encryptedCardNumber').getAttribute('aria-invalid'))
            .eql('true')
            // Expect error field in iframe to be filled
            .expect(Selector('#ariaErrorField').withExactText(UNSUPPORTED_CARD).exists)
            .ok()
            .switchToMainWindow();

        /**
         * Click button - to force blur event
         */
        await t.click('.adyen-checkout__button');

        // Expect error field in iframe to persist
        await t
            .switchToIframe(iframeSelector.nth(0))
            .expect(Selector('#ariaErrorField').withExactText(UNSUPPORTED_CARD).exists)
            .ok()
            .switchToMainWindow();

        /**
         * Add more digits
         */
        await cardUtils.fillCardNumber(t, '0000');

        // Merchant/components level error field persists
        await t.expect(errorLabel.withExactText(UNSUPPORTED_CARD).exists).ok();

        // Expect errors received & processed at SF level to persist
        await t
            .switchToIframe(iframeSelector.nth(0))
            // Expect input in iframe to have aria-invalid set to true
            .expect(Selector('#encryptedCardNumber').getAttribute('aria-invalid'))
            .eql('true')
            // Expect error field in iframe to be filled
            .expect(Selector('#ariaErrorField').withExactText(UNSUPPORTED_CARD).exists)
            .ok()
            .switchToMainWindow();

        /**
         * Add last digit to complete a number that passes luhn
         */
        await cardUtils.fillCardNumber(t, '4');

        // Field should be marked as not valid
        await t.expect(getSFState('valid', 'encryptedCardNumber')).eql(false);

        // Merchant/components level error field persists
        await t.expect(errorLabel.withExactText(UNSUPPORTED_CARD).exists).ok();

        // Expect errors received & processed at SF level to persist
        await t
            .switchToIframe(iframeSelector.nth(0))
            // Expect input in iframe to have aria-invalid set to true
            .expect(Selector('#encryptedCardNumber').getAttribute('aria-invalid'))
            .eql('true')
            // Expect error field in iframe to be filled
            .expect(Selector('#ariaErrorField').withExactText(UNSUPPORTED_CARD).exists)
            .ok()
            .switchToMainWindow();

        /**
         * Delete number
         */
        await cardUtils.deleteCardNumber(t);

        // Merchant/components level error field hidden
        await t.expect(errorLabel.filterHidden().exists).ok();

        // Error clearing received & processed at SF level
        await t
            .switchToIframe(iframeSelector.nth(0))
            // Expect input in iframe to have aria-invalid set to true
            .expect(Selector('#encryptedCardNumber').getAttribute('aria-invalid'))
            .eql('true')
            // Expect error field in iframe to be unfilled
            .expect(Selector('#ariaErrorField').withExactText('').exists)
            .ok()
            .switchToMainWindow();

        /**
         * Add supported number
         */
        await cardUtils.fillCardNumber(t, MAESTRO_CARD);

        // Field should be marked as valid
        await t.expect(getSFState('valid', 'encryptedCardNumber')).eql(true);

        // With encrypted blob
        await t.expect(getSFState('data', 'encryptedCardNumber')).contains('adyenjs_0_1_');

        // Validity received & processed at SF level
        await t
            .switchToIframe(iframeSelector.nth(0))
            // Expect input in iframe to have aria-invalid set to true
            .expect(Selector('#encryptedCardNumber').getAttribute('aria-invalid'))
            .eql('false')
            // Expect error field in iframe to be unfilled
            .expect(Selector('#ariaErrorField').withExactText('').exists)
            .ok()
            .switchToMainWindow();
    }
);

test(
    'Same as previous test except ' +
        'when adding supported number we paste it straight in then ' +
        'check error states are removed at merchant and SF levels then ' +
        'check field is seen as valid at merchant and SF levels',
    async t => {
        // Start, allow time to load
        await start(t, 2000, TEST_SPEED);

        // Hidden error field
        await t.expect(errorLabel.filterHidden().exists).ok();

        /**
         * Add partial number
         */
        await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD.substr(0, 11));

        // Merchant/components level error field visible & text set
        await t
            .expect(errorLabel.filterVisible().exists)
            .ok()
            .expect(errorLabel.withExactText(UNSUPPORTED_CARD).exists)
            .ok();

        // Error received & processed at SF level
        await t
            .switchToIframe(iframeSelector.nth(0))
            // Expect input in iframe to have aria-invalid set to true
            .expect(Selector('#encryptedCardNumber').getAttribute('aria-invalid'))
            .eql('true')
            // Expect error field in iframe to be filled
            .expect(Selector('#ariaErrorField').withExactText(UNSUPPORTED_CARD).exists)
            .ok()
            .switchToMainWindow();

        /**
         * Click button - to force blur event
         */
        await t.click('.adyen-checkout__button');

        // Expect error field in iframe to persist
        await t
            .switchToIframe(iframeSelector.nth(0))
            .expect(Selector('#ariaErrorField').withExactText(UNSUPPORTED_CARD).exists)
            .ok()
            .switchToMainWindow();

        /**
         * Add more digits
         */
        await cardUtils.fillCardNumber(t, '0000');

        // Merchant/components level error field persists
        await t.expect(errorLabel.withExactText(UNSUPPORTED_CARD).exists).ok();

        // Expect errors received & processed at SF level to persist
        await t
            .switchToIframe(iframeSelector.nth(0))
            // Expect input in iframe to have aria-invalid set to true
            .expect(Selector('#encryptedCardNumber').getAttribute('aria-invalid'))
            .eql('true')
            // Expect error field in iframe to be filled
            .expect(Selector('#ariaErrorField').withExactText(UNSUPPORTED_CARD).exists)
            .ok()
            .switchToMainWindow();

        /**
         * Add last digit to complete a number that passes luhn
         */
        await cardUtils.fillCardNumber(t, '4');

        // Field should be marked as not valid
        await t.expect(getSFState('valid', 'encryptedCardNumber')).eql(false);

        // Merchant/components level error field persists
        await t.expect(errorLabel.withExactText(UNSUPPORTED_CARD).exists).ok();

        // Expect errors received & processed at SF level to persist
        await t
            .switchToIframe(iframeSelector.nth(0))
            // Expect input in iframe to have aria-invalid set to true
            .expect(Selector('#encryptedCardNumber').getAttribute('aria-invalid'))
            .eql('true')
            // Expect error field in iframe to be filled
            .expect(Selector('#ariaErrorField').withExactText(UNSUPPORTED_CARD).exists)
            .ok()
            .switchToMainWindow();

        /**
         * Paste in supported number
         */
        await cardUtils.fillCardNumber(t, MAESTRO_CARD, 'paste');

        // Merchant/components level error field hidden
        await t.expect(errorLabel.filterHidden().exists).ok();

        // Field should be marked as valid
        await t.expect(getSFState('valid', 'encryptedCardNumber')).eql(true);

        // With encrypted blob
        await t.expect(getSFState('data', 'encryptedCardNumber')).contains('adyenjs_0_1_');

        // Validity received & processed at SF level
        await t
            .switchToIframe(iframeSelector.nth(0))
            // Expect input in iframe to have aria-invalid set to true
            .expect(Selector('#encryptedCardNumber').getAttribute('aria-invalid'))
            .eql('false')
            // Expect error field in iframe to be unfilled
            .expect(Selector('#ariaErrorField').withExactText('').exists)
            .ok()
            .switchToMainWindow();
    }
);
