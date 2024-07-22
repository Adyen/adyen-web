import { ClientFunction, Selector } from 'testcafe';
import { start, getIframeSelector, getIsValid } from '../../utils/commonUtils';
import cu from '../utils/cardUtils';
import { CARDS_URL } from '../../pages';
import { TEST_DATE_VALUE, TEST_CVC_VALUE, KOREAN_TEST_CARD } from '../utils/constants';

const setForceClick = ClientFunction(val => {
    window.testCafeForceClick = val;
});

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.card-field iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing card component dedicated to a single, "exotic", txVariant that we don't recognise internally but that is recognised by /binLookup`
    .page(CARDS_URL)
    .clientScripts('branding.exotic.clientScripts.js');

/**
 * Relies on sf v3.3.1
 */
// DONE
test('Input details for "exotic" brand - card should still become valid, with no errors', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Exotic brand
    await cardUtils.fillCardNumber(t, KOREAN_TEST_CARD);

    await setForceClick(true); // to force error, or rather lack of it

    // Expect no errors
    await t.expect(Selector('.adyen-checkout__field--error').exists).notOk();

    await cardUtils.fillDate(t, TEST_DATE_VALUE);
    await cardUtils.fillCVC(t, TEST_CVC_VALUE);

    // Is valid
    await t.expect(getIsValid('card')).eql(true);
});
