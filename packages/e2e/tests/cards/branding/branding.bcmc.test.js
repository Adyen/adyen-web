import { Selector } from 'testcafe';
import { start, getIframeSelector, getIsValid } from '../../utils/commonUtils';
import cu from '../utils/cardUtils';
import { CARDS_URL } from '../../pages';
import { TEST_DATE_VALUE, BCMC_CARD } from '../utils/constants';

const cvcSpan = Selector('.card-field .adyen-checkout__field__cvc');
const optionalCVCSpan = Selector('.card-field .adyen-checkout__field__cvc--optional');
const cvcLabel = Selector('.card-field .adyen-checkout__label__text');
const brandingIcon = Selector('.card-field .adyen-checkout__card__cardNumber__brandIcon');

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.card-field iframe');

const cardUtils = cu(iframeSelector);

/**
 * NOTE - needs a separate test because our BCMC card is actually dual branded with maestro - so to test just BCMC we need our
 * card component to not support maestro - therefore we need a separate clientScript
 */
fixture`Testing branding, as detected by /binLookup, for bcmc (hidden cvc field)`.page(CARDS_URL).clientScripts('branding.bcmc.clientScripts.js');

test('Test card is valid with bcmc details (no cvc) ' + 'then test it is invalid (& brand reset) when number deleted', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // generic card
    await t.expect(brandingIcon.getAttribute('src')).contains('nocard.svg');

    // BCMC
    await cardUtils.fillCardNumber(t, BCMC_CARD);
    await cardUtils.fillDate(t, TEST_DATE_VALUE);

    await t
        // bcmc card icon
        .expect(brandingIcon.getAttribute('src'))
        .contains('bcmc.svg')

        // hidden cvc field
        .expect(cvcSpan.filterHidden().exists)
        .ok();

    // Is valid
    await t.expect(getIsValid('card')).eql(true);

    // Delete number
    await cardUtils.deleteCardNumber(t);

    // Card is reset
    await t
        // generic card icon
        .expect(brandingIcon.getAttribute('src'))
        .contains('nocard.svg')

        // visible cvc field
        .expect(cvcSpan.filterVisible().exists)
        .ok()

        // with regular text
        .expect(cvcLabel.withExactText('Security code').exists)
        .ok()

        // and not optional
        .expect(optionalCVCSpan.exists)
        .notOk();

    await t.expect(getIsValid('card')).eql(false);
});
