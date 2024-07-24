import { Selector } from 'testcafe';
import { start, getIframeSelector } from '../../utils/commonUtils';
import { CUSTOMCARDS_URL } from '../../pages';
import LANG from '../../../../server/translations/en-US.json';
import ccu from '../utils/customCardUtils';

const errorHolder = Selector('.pm-form-label__error-text');

const CARD_TOO_OLD = LANG['cc.dat.912'];
const CARD_TOO_FAR = LANG['cc.dat.913'];
const CARD_EXPIRES_BEFORE = LANG['cc.dat.914'];

const TEST_SPEED = 1;

// Applies to custom card with separate date fields
const iframeSelectorSeparate = getIframeSelector('.secured-fields-2 iframe');
const customCardUtils = ccu(iframeSelectorSeparate);

fixture`Testing setting minimumExpiryDate (on regular Custom card component) - that it is recognised but doesn't override the other checks on date for a card being too old or too far in the future`
    .page(CUSTOMCARDS_URL)
    .clientScripts('expiryDate.clientScripts.js');

test('With minimumExpiryDate set - input an expiry date that is too old & expect the correct error ', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Card out of date
    await customCardUtils.fillMonth(t, '12');
    await customCardUtils.fillYear(t, '20');

    // Expect visible error: "Card too old"
    await t.expect(errorHolder.filterVisible().exists).ok().expect(errorHolder.withExactText(CARD_TOO_OLD).exists).ok();
});

test('With minimumExpiryDate set - input an expiry date that is 1 month before it & expect the correct error', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Card out of date
    await customCardUtils.fillMonth(t, '08');
    await customCardUtils.fillYear(t, '24');

    // Expect visible error: "Card expires before..."
    await t.expect(errorHolder.filterVisible().exists).ok().expect(errorHolder.withExactText(CARD_EXPIRES_BEFORE).exists).ok();
});

test('With minimumExpiryDate set - input an expiry date that is matches it & expect no error ', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Card in date
    await customCardUtils.fillMonth(t, '09');
    await customCardUtils.fillYear(t, '24');

    // Expect NO errors
    await t.expect(errorHolder.filterHidden().exists).ok();
});

test('With minimumExpiryDate set - input an expiry date that exceeds it (a bit) & expect no error', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Card in date
    await customCardUtils.fillMonth(t, '04');
    await customCardUtils.fillYear(t, '25');

    // Expect NO errors
    await t.expect(errorHolder.filterHidden().exists).ok();
});

test('With minimumExpiryDate set - input an expiry date that is too far in the future, & expect the correct error ', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Card out of date
    await customCardUtils.fillMonth(t, '12');
    await customCardUtils.fillYear(t, '90');

    // Expect visible error: "Card too far in the future"
    await t.expect(errorHolder.filterVisible().exists).ok().expect(errorHolder.withExactText(CARD_TOO_FAR).exists).ok();
});

test(
    'General "date edit" bug: with minimumExpiryDate set - input an expiry date that is matches it & expect no error ' +
        'then edit the date to be before the minimumExpiryDate and expect that to register as an error',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        // Card in date
        await customCardUtils.fillMonth(t, '09');
        await customCardUtils.fillYear(t, '24');

        // Expect NO errors
        await t.expect(errorHolder.filterHidden().exists).ok();

        // Card out of date
        await customCardUtils.fillMonth(t, '08', 'paste');

        // Expect visible error: "Card expires before..."
        await t.expect(errorHolder.filterVisible().exists).ok().expect(errorHolder.withExactText(CARD_EXPIRES_BEFORE).exists).ok();
    }
);

test(
    'General "date edit" bug: input a valid expiry date & expect no error ' +
        'then edit the date to be before invalid and expect that to immediately register as an error',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        // Card in date
        await customCardUtils.fillMonth(t, '04');
        await customCardUtils.fillYear(t, '30');

        // Expect NO errors
        await t.expect(errorHolder.filterHidden().exists).ok();

        // Card out of date
        await customCardUtils.fillYear(t, '10', 'paste');

        // Expect visible error: "Card too old"
        await t.expect(errorHolder.filterVisible().exists).ok().expect(errorHolder.withExactText(CARD_TOO_OLD).exists).ok();
    }
);
