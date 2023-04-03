const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') });

import { Selector } from 'testcafe';
import { start, getIframeSelector, getIsValid } from '../../../../utils/commonUtils';
import cu from '../../../utils/cardUtils';
import { CARDS_URL } from '../../../../pages';
import { BCMC_CARD } from '../../../utils/constants';

const cvcSpan = Selector('.card-field .adyen-checkout__field__cvc');
const optionalCVCSpan = Selector('.card-field .adyen-checkout__field__cvc--optional');
const cvcLabel = Selector('.card-field .adyen-checkout__label__text');
const brandingIcon = Selector('.card-field .adyen-checkout__card__cardNumber__brandIcon');

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.card-field iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing a card for a response that should indicate hidden cvc)`.page(CARDS_URL).clientScripts('binLookup.mocks.clientScripts.js');

test('Test card has hidden cvc field ' + 'then complete date and see card is valid ' + ' then delete card number and see card reset', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

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

    // Unknown card
    await cardUtils.fillCardNumber(t, BCMC_CARD);

    await t
        // bcmc card icon
        .expect(brandingIcon.getAttribute('src'))
        .contains('bcmc.svg')

        // hidden cvc field
        .expect(cvcSpan.filterHidden().exists)
        .ok();

    // Fill date
    await cardUtils.fillDate(t);

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
