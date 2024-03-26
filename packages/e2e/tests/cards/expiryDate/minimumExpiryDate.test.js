import { Selector } from 'testcafe';
import { start, getIframeSelector } from '../../utils/commonUtils';
import cu from '../utils/cardUtils';
import { CARDS_URL } from '../../pages';
import LANG from '../../../../server/translations/en-US.json';

const errorHolder = Selector('.card-field .adyen-checkout__field--error');
const errorLabel = Selector('.card-field .adyen-checkout-contextual-text--error');

const CARD_TOO_OLD = LANG['cc.dat.912'];
const CARD_TOO_FAR = LANG['cc.dat.913'];
const CARD_EXPIRES_BEFORE = LANG['cc.dat.914'];

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.card-field iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing setting minimumExpiryDate - that it is recognised but doesn't override the other checks on date for a card being too old or too far in the future`
    .page(CARDS_URL)
    .clientScripts('expiryDate.clientScripts.js');

test('#1 With minimumExpiryDate set - input an expiry date that is too old & expect the correct error ', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Card out of date
    await cardUtils.fillDate(t, '12/20');

    // Expect errors
    await t.expect(errorHolder.exists).ok();

    // Test UI shows "Card too old" error
    await t
        .expect(errorLabel.exists)
        .ok()
        // with text
        .expect(errorLabel.withExactText(CARD_TOO_OLD).exists)
        .ok();
});

test('#2 With minimumExpiryDate set - input an expiry date that is 1 month before it & expect the correct error', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Card out of date
    await cardUtils.fillDate(t, '08/24');

    // Expect errors
    await t.expect(errorHolder.exists).ok();

    // Test UI shows "Card expires before..." error
    await t
        .expect(errorLabel.exists)
        .ok()
        // with text
        .expect(errorLabel.withExactText(CARD_EXPIRES_BEFORE).exists)
        .ok();
});

test('#3 With minimumExpiryDate set - input an expiry date that is matches it & expect no error ', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Card in date
    await cardUtils.fillDate(t, '09/24');

    // Expect NO errors
    await t.expect(errorHolder.exists).notOk();

    // Test UI shows no error
    await t.expect(errorLabel.exists).notOk();
});

test('#4 With minimumExpiryDate set - input an expiry date that exceeds it (a bit) & expect no error', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Card in date
    await cardUtils.fillDate(t, '04/25');

    // Expect NO errors
    await t.expect(errorHolder.exists).notOk();

    // Test UI shows no error
    await t.expect(errorLabel.exists).notOk();
});

test('#5 With minimumExpiryDate set - input an expiry date that is too far in the future, & expect the correct error ', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Card out of date
    await cardUtils.fillDate(t, '12/90');

    // Expect errors
    await t.expect(errorHolder.exists).ok();

    // Test UI shows "Card too far in the future" error
    await t
        .expect(errorLabel.exists)
        .ok()
        // with text
        .expect(errorLabel.withExactText(CARD_TOO_FAR).exists)
        .ok();
});

test(
    '#6 General "date edit" bug: with minimumExpiryDate set - input an expiry date that is matches it & expect no error ' +
        'then edit the date to be before the minimumExpiryDate and expect that to register as an error',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        // Card in date
        await cardUtils.fillDate(t, '09/24');

        // Expect NO errors
        await t.expect(errorHolder.exists).notOk();

        // Test UI shows no error
        await t.expect(errorLabel.exists).notOk();

        // Card out of date
        await cardUtils.fillDate(t, '08/24', 'paste');

        // Expect errors
        await t.expect(errorHolder.exists).ok();

        // Test UI shows "Card expires before..." error
        await t
            .expect(errorLabel.exists)
            .ok()
            // with text
            .expect(errorLabel.withExactText(CARD_EXPIRES_BEFORE).exists)
            .ok();
    }
);

test(
    'General "date edit" bug: input a valid expiry date & expect no error ' +
        'then edit the date to be before invalid and expect that to immediately register as an error',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        // Card in date
        await cardUtils.fillDate(t, '04/30');

        // Expect NO errors
        await t.expect(errorHolder.exists).notOk();

        // Test UI shows no error
        await t.expect(errorLabel.exists).notOk();

        // Card out of date
        await cardUtils.fillDate(t, '04/10', 'paste');

        // Expect errors
        await t.expect(errorHolder.exists).ok();

        // Test UI shows "Card too old" error
        await t
            .expect(errorLabel.exists)
            .ok()
            // with text
            .expect(errorLabel.withExactText(CARD_TOO_OLD).exists)
            .ok();
    }
);
