import { turnOffSDKMocking } from '../../../../_common/cardMocks';
import CardComponentPage from '../../../../_models/CardComponent.page';
import { REGULAR_TEST_CARD, MAESTRO_CARD, UNKNOWN_VISA_CARD } from '../../../utils/constants';
import LANG from '../../../../../../server/translations/en-US.json';

const UNSUPPORTED_CARD = LANG['cc.num.903'];

const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') }); // 2 dirs up

const cardPage = new CardComponentPage();

fixture`Testing error handling related to binLookup v2 response`
    .beforeEach(async t => {
        await t.navigateTo(cardPage.pageUrl);
        // For individual test suites (that rely on binLookup & perhaps are being run in isolation)
        // - provide a way to ensure SDK bin mocking is turned off
        await turnOffSDKMocking();
    })
    .clientScripts('./unsupportedCardErrors.clientScripts.js');

test('#1 Enter number of unsupported card, ' + 'then check UI shows an error ' + 'then PASTE supported card & check UI error is cleared', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Fill card field with unsupported number
    await cardPage.cardUtils.fillCardNumber(t, MAESTRO_CARD);

    // Test UI shows "Unsupported card" error
    await t
        .expect(cardPage.numErrorText.exists)
        .ok()
        // with text
        .expect(cardPage.numErrorText.withExactText(UNSUPPORTED_CARD).exists)
        .ok();

    // Past card field with supported number
    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD, 'paste');

    // Test UI shows "Unsupported card" error has gone
    await t.expect(cardPage.numErrorText.exists).notOk();
});

test(
    '#2 Enter number of unsupported card, ' +
        'then check UI shows an error ' +
        'then press the Pay button ' +
        'then check UI shows more errors ' +
        'then PASTE supported card & check PAN UI errors are cleared whilst others persist',
    async t => {
        // Wait for field to appear in DOM
        await cardPage.numHolder();

        // Fill card field with unsupported number
        await cardPage.cardUtils.fillCardNumber(t, MAESTRO_CARD);

        // Test UI shows "Unsupported card" error
        await t
            .expect(cardPage.numErrorText.exists)
            .ok()
            // with text
            .expect(cardPage.numErrorText.withExactText(UNSUPPORTED_CARD).exists)
            .ok();

        // Click Pay (which will call showValidation on all fields)
        await t
            .click(cardPage.payButton)
            // More visible errors
            .expect(cardPage.numLabelTextError.exists)
            .ok()
            .expect(cardPage.dateLabelTextError.exists)
            .ok()
            .expect(cardPage.cvcLabelTextError.exists)
            .ok();

        // Past card field with supported number
        await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD, 'paste');

        // Test UI shows "Unsupported card" error has gone
        await t.expect(cardPage.numErrorText.exists).notOk();

        // PAN error cleared but other errors persist
        await t
            .expect(cardPage.numLabelTextError.exists)
            .notOk()
            .expect(cardPage.dateLabelTextError.exists)
            .ok()
            .expect(cardPage.cvcLabelTextError.exists)
            .ok();
    }
);

test('#3 Enter number of unsupported card, ' + 'then check UI shows an error ' + 'then PASTE card not in db check UI error is cleared', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Fill card field with unsupported number
    await cardPage.cardUtils.fillCardNumber(t, MAESTRO_CARD);

    // Test UI shows "Unsupported card" error
    await t
        .expect(cardPage.numErrorText.exists)
        .ok()
        // with text
        .expect(cardPage.numErrorText.withExactText(UNSUPPORTED_CARD).exists)
        .ok();

    // Past card field with supported number
    await cardPage.cardUtils.fillCardNumber(t, UNKNOWN_VISA_CARD, 'paste');

    // Test UI shows "Unsupported card" error has gone
    await t.expect(cardPage.numErrorText.exists).notOk();
});

test('#4 Enter number of unsupported card, ' + 'then check UI shows an error ' + 'then delete PAN & check UI error is cleared', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Fill card field with unsupported number
    await cardPage.cardUtils.fillCardNumber(t, MAESTRO_CARD);

    // Test UI shows "Unsupported card" error
    await t
        .expect(cardPage.numErrorText.exists)
        .ok()
        // with text
        .expect(cardPage.numErrorText.withExactText(UNSUPPORTED_CARD).exists)
        .ok();

    // Past card field with supported number
    await cardPage.cardUtils.deleteCardNumber(t);

    // Test UI shows "Unsupported card" error has gone
    await t.expect(cardPage.numErrorText.exists).notOk();
});
