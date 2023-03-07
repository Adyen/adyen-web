import CardComponentPage from '../../_models/CardComponent.page';
import { REGULAR_TEST_CARD, SR_INDICATOR_PREFIX } from '../utils/constants';
import LANG from '../../../../lib/src/language/locales/en-US.json';

const CARD_NUMBER_EMPTY = LANG['error.va.sf-cc-num.02'] + SR_INDICATOR_PREFIX;
const EXPIRY_DATE_EMPTY = LANG['error.va.sf-cc-dat.04'] + SR_INDICATOR_PREFIX;
const CVC_EMPTY = LANG['error.va.sf-cc-cvc.01'] + SR_INDICATOR_PREFIX;

const cardPage = new CardComponentPage();

fixture`Testing card's error panel - error panel exists and is visible`
    .beforeEach(async t => {
        await t.navigateTo(cardPage.pageUrl);
    })
    .clientScripts('./errorPanel.card.visible.clientScripts.js');

test('#1 Error panel is present at start, when there are no errors, but is empty', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // error panel exists but is empty
    await t.expect(cardPage.errorPanelVisible.exists).ok().expect(cardPage.errorPanelEls.nth(0).exists).notOk();
});

test('#2 Click pay with empty fields and error panel is populated', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // click pay, to validate & generate errors
    await t.click(cardPage.payButton);

    // Expect 3 elements, in order, with specific text
    await t
        .expect(cardPage.errorPanelEls.nth(0).withExactText(CARD_NUMBER_EMPTY).exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(1).withExactText(EXPIRY_DATE_EMPTY).exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(2).withExactText(CVC_EMPTY).exists)
        .ok();

    // no 4th element
    await t.expect(cardPage.errorPanelEls.nth(3).exists).notOk();

    // Expect focus to be place on Card number field - since SRConfig for this card comp says it should be
    await t.expect(cardPage.numLabelWithFocus.exists).ok();
});

test('#3 Fill out PAN & see that first error in error panel is date related', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    // click pay, to validate & generate errors
    await t.click(cardPage.payButton);

    // Expect 2 elements, in order, with specific text
    await t
        .expect(cardPage.errorPanelEls.nth(0).withExactText(EXPIRY_DATE_EMPTY).exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(1).withExactText(CVC_EMPTY).exists)
        .ok();

    // no 3rd element
    await t.expect(cardPage.errorPanelEls.nth(2).exists).notOk();

    // Expect focus to be place on Expiry date field
    await t.expect(cardPage.dateLabelWithFocus.exists).ok();
});
