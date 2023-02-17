const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') });

import { Selector } from 'testcafe';
import { start, getIframeSelector, getIsValid } from '../../../../utils/commonUtils';
import cu from '../../../utils/cardUtils';
import { CARDS_URL } from '../../../../pages';
import { SYNCHRONY_PLCC_NO_LUHN, TEST_CVC_VALUE } from '../../../utils/constants';

const brandingIcon = Selector('.card-field .adyen-checkout__card__cardNumber__brandIcon');

const dateSpan = Selector('.card-field .adyen-checkout__card__exp-date__input');

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.card-field iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing a PLCC, for a response that should indicate hidden expiryDate field)`.page(CARDS_URL).clientScripts('plcc.clientScripts.js');

test('Test plcc card hides date field ' + 'then complete date and see card is valid ' + ' then delete card number and see card reset', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Generic card
    await t.expect(brandingIcon.getAttribute('src')).contains('nocard.svg');

    // Unknown card
    await cardUtils.fillCardNumber(t, SYNCHRONY_PLCC_NO_LUHN);

    await t
        // hidden date field
        .expect(dateSpan.filterHidden().exists)
        .ok();

    // Is not valid
    await t.expect(getIsValid('card')).eql(false);

    // Fill cvc
    await cardUtils.fillCVC(t, TEST_CVC_VALUE);

    // Is valid
    await t.expect(getIsValid('card')).eql(true);

    // Delete number
    await cardUtils.deleteCardNumber(t);

    // Card is reset
    await t
        // generic card icon
        .expect(brandingIcon.getAttribute('src'))
        .contains('nocard.svg')

        // visible date field
        .expect(dateSpan.filterVisible().exists)
        .ok();

    await t.expect(getIsValid('card')).eql(false);
});
