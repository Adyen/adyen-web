import CardComponentPage from '../../_models/CardComponent.page';

import LANG from '../../../../server/translations/en-US.json';
import { SR_INDICATOR_PREFIX } from '../utils/constants';

const CARD_NUMBER_EMPTY = LANG['cc.num.900'] + SR_INDICATOR_PREFIX;
const EXPIRY_DATE_EMPTY = LANG['cc.dat.910'] + SR_INDICATOR_PREFIX;
const CVC_EMPTY = LANG['cc.cvc.920'] + SR_INDICATOR_PREFIX;

const INVALID_NAME = LANG['creditCard.holderName.invalid'] + SR_INDICATOR_PREFIX;

const cardPage = new CardComponentPage();

fixture`Testing card, with holder name on top, error panel exists but is not visible`
    .beforeEach(async t => {
        await t.navigateTo(cardPage.pageUrl);
    })
    .clientScripts('./errorPanel.hidden.clientScripts.js');

test('#1 Click pay with empty fields and hidden error panel is populated', async t => {
    // error panel exists at startup but is not visible
    await t.expect(cardPage.errorPanelHidden.exists).ok();

    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // click pay, to validate & generate errors
    await t
        .click(cardPage.payButton)
        // error panel exists but is not visible
        .expect(cardPage.errorPanelHidden.exists)
        .ok();

    // Expect 4 elements, in order, with specific text
    await t
        .expect(cardPage.errorPanelEls.nth(0).withExactText(INVALID_NAME).exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(1).withExactText(CARD_NUMBER_EMPTY).exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(2).withExactText(EXPIRY_DATE_EMPTY).exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(3).withExactText(CVC_EMPTY).exists)
        .ok();

    // no 5th element
    await t.expect(cardPage.errorPanelEls.nth(4).exists).notOk();

    // Expect focus not to be place on holder name field - since SRConfig for this card comp says it shouldn't be
    await t.expect(cardPage.holderNameLabelWithFocus.exists).notOk();
});
