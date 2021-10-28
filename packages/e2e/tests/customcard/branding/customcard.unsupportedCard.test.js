import { start, getAriaErrorField, checkIframeElHasExactText } from '../../utils/commonUtils';
import { REGULAR_TEST_CARD, MAESTRO_CARD } from '../../cards/utils/constants';
import LANG from '../../../../lib/src/language/locales/en-US.json';

import CustomCardComponentPage from '../../_models/CustomCardComponent.page';

const cardPage = new CustomCardComponentPage();

const BASE_REF = 'securedFields';

const UNSUPPORTED_CARD = LANG['error.va.sf-cc-num.03'];

const TEST_SPEED = 1;

fixture`Testing persistence of "Unsupported card" error and state at both component & securedField level`
    .beforeEach(async t => {
        await t.navigateTo(cardPage.pageUrl);
        // For individual test suites (that rely on binLookup & perhaps are being run in isolation)
        // - provide a way to ensure SDK bin mocking is turned off
        await cardPage.turnOffSDKMocking();
    })
    .clientScripts('./customcard.unsupportedCard.clientScripts.js');

test(
    'Enter partial card number that is not supported then ' +
        'check resulting error is processed correctly at merchant and SF level then ' +
        'add digits to number and check error states persist then ' +
        'complete number to make it "valid" (right length, passes luhn then ' +
        'check error states persist then ' +
        'delete number & check error states clear then ' +
        'add supported number and check field is seen as valid at merchant and SF levels',
    async t => {
        // Start, allow time to load
        await start(t, 1000, TEST_SPEED);

        // Hidden error field
        await t.expect(cardPage.numErrorText.filterHidden().exists).ok();

        // Add partial number
        await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD.substr(0, 11));

        // Components level error field visible & text set
        await t
            .expect(cardPage.numErrorText.filterVisible().exists)
            .ok()
            .expect(cardPage.numErrorText.withExactText(UNSUPPORTED_CARD).exists)
            .ok();

        /**
         * Error received & processed at SF level
         */
        // Expect input in iframe to have aria-invalid set to true
        await cardPage.cardUtils.checkIframeForAttrVal(t, 0, 'encryptedCardNumber', 'aria-invalid', 'true');

        // Expect error field in iframe to be filled
        await checkIframeElHasExactText(t, cardPage.iframeSelector, 0, getAriaErrorField('encryptedCardNumber'), UNSUPPORTED_CARD);

        // Click button - to force blur event
        await t.click(cardPage.payButton);

        // Expect unsupported card error in iframe to persist (and not become 'incomplete field')
        await checkIframeElHasExactText(t, cardPage.iframeSelector, 0, getAriaErrorField('encryptedCardNumber'), UNSUPPORTED_CARD);

        // Add more digits
        await cardPage.cardUtils.fillCardNumber(t, '0000');

        // Components level error field persists
        await t.expect(cardPage.numErrorText.withExactText(UNSUPPORTED_CARD).exists).ok();

        /**
         * Expect errors received & processed at SF level to persist
         */
        // Expect input in iframe to have aria-invalid set to true
        await cardPage.cardUtils.checkIframeForAttrVal(t, 0, 'encryptedCardNumber', 'aria-invalid', 'true');

        // Expect error field in iframe to be filled
        await checkIframeElHasExactText(t, cardPage.iframeSelector, 0, getAriaErrorField('encryptedCardNumber'), UNSUPPORTED_CARD);

        // Add last digit to complete a number that passes luhn
        await cardPage.cardUtils.fillCardNumber(t, '4');

        // Field should be marked in state as not valid
        await t.expect(cardPage.getFromState(BASE_REF, 'valid.encryptedCardNumber')).eql(false);

        // Merchant/components level error field persists
        await t.expect(cardPage.numErrorText.withExactText(UNSUPPORTED_CARD).exists).ok();

        // Expect errors received & processed at SF level to persist
        await cardPage.cardUtils.checkIframeForAttrVal(t, 0, 'encryptedCardNumber', 'aria-invalid', 'true');

        await checkIframeElHasExactText(t, cardPage.iframeSelector, 0, getAriaErrorField('encryptedCardNumber'), UNSUPPORTED_CARD);

        // Delete number
        await cardPage.cardUtils.deleteCardNumber(t);

        // Components level error field hidden
        await t.expect(cardPage.numErrorText.filterHidden().exists).ok();

        /**
         * Expect error clearing received & processed at SF level
         */
        // Expect input in iframe to have aria-invalid set to true
        await cardPage.cardUtils.checkIframeForAttrVal(t, 0, 'encryptedCardNumber', 'aria-invalid', 'true');

        // Expect error field in iframe to be unfilled
        await checkIframeElHasExactText(t, cardPage.iframeSelector, 0, getAriaErrorField('encryptedCardNumber'), '');

        // Add supported number
        await cardPage.cardUtils.fillCardNumber(t, MAESTRO_CARD);

        // Field should be marked in state as valid...
        await t.expect(cardPage.getFromState(BASE_REF, 'valid.encryptedCardNumber')).eql(true);

        // ...with encrypted blob
        await t.expect(cardPage.getFromState(BASE_REF, 'data.encryptedCardNumber')).contains('adyenjs_0_1_');

        /**
         * Validity received & processed at SF level
         */
        // Expect input in iframe to have aria-invalid set to false
        await cardPage.cardUtils.checkIframeForAttrVal(t, 0, 'encryptedCardNumber', 'aria-invalid', 'false');

        // Expect error field in iframe to be unfilled
        await checkIframeElHasExactText(t, cardPage.iframeSelector, 0, getAriaErrorField('encryptedCardNumber'), '');
    }
);

test(
    'Enter unsupported card and expect similar errors in UI, state & SF as previous test, then ' +
        'when adding supported number we paste it straight in then ' +
        'check error states are removed at merchant and SF levels then ' +
        'check field is seen as valid at merchant and SF levels',
    async t => {
        // Start, allow time to load
        await start(t, 1000, TEST_SPEED);

        // Add unsupported number
        await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

        // Components level error field visible & text set
        await t
            .expect(cardPage.numErrorText.filterVisible().exists)
            .ok()
            .expect(cardPage.numErrorText.withExactText(UNSUPPORTED_CARD).exists)
            .ok();

        /**
         * Error received & processed at SF level
         */
        // Expect input in iframe to have aria-invalid set to true
        await cardPage.cardUtils.checkIframeForAttrVal(t, 0, 'encryptedCardNumber', 'aria-invalid', 'true');

        // Expect error field in iframe to be filled
        await checkIframeElHasExactText(t, cardPage.iframeSelector, 0, getAriaErrorField('encryptedCardNumber'), UNSUPPORTED_CARD);

        // Field should be marked in state as not valid
        await t.expect(cardPage.getFromState(BASE_REF, 'valid.encryptedCardNumber')).eql(false);

        /**
         * Paste in supported number
         */
        await cardPage.cardUtils.fillCardNumber(t, MAESTRO_CARD, 'paste');

        // Merchant/components level error field hidden
        await t.expect(cardPage.numErrorText.filterHidden().exists).ok();

        // Field should be marked in state as valid...
        await t.expect(cardPage.getFromState(BASE_REF, 'valid.encryptedCardNumber')).eql(true);

        // ...with encrypted blob
        await t.expect(cardPage.getFromState(BASE_REF, 'data.encryptedCardNumber')).contains('adyenjs_0_1_');

        /**
         * Validity received & processed at SF level
         */
        // Expect input in iframe to have aria-invalid set to false
        await cardPage.cardUtils.checkIframeForAttrVal(t, 0, 'encryptedCardNumber', 'aria-invalid', 'false');

        // Expect error field in iframe to be unfilled
        await checkIframeElHasExactText(t, cardPage.iframeSelector, 0, getAriaErrorField('encryptedCardNumber'), '');
    }
);
