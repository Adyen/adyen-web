import CardComponentPage from '../../_models/CardComponent.page';
import { KOREAN_TEST_CARD } from '../utils/constants';
import LANG from '../../../../lib/src/language/locales/en-US.json';

const CARD_NUMBER_EMPTY = LANG['error.va.sf-cc-num.02'];
const EXPIRY_DATE_EMPTY = LANG['error.va.sf-cc-dat.04'];
const CVC_EMPTY = LANG['error.va.sf-cc-cvc.01'];
const PWD_EMPTY = LANG['error.va.sf-kcp-pwd.01'];

const INVALID_NAME = LANG['creditCard.holderName.invalid'];
const INVALID_TAX_NUMBER = LANG['creditCard.taxNumber.invalid'];

const cardPage = new CardComponentPage();

fixture.only`Testing kcpCard, with holderName, error panel`
    .beforeEach(async t => {
        await t.navigateTo(cardPage.pageUrl);
    })
    .clientScripts('./errorPanel.kcpCard.visible.clientScripts.js');

test('#1 Click pay with empty fields and error panel is populated', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // click pay, to validate & generate errors
    await t
        .click(cardPage.payButton)
        // error panel exists
        .expect(cardPage.errorPanelVisible.exists)
        .ok();

    // Expect 6 elements, in order, with specific text
    await t
        .expect(cardPage.errorPanelEls.nth(0).withExactText(CARD_NUMBER_EMPTY).exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(1).withExactText(EXPIRY_DATE_EMPTY).exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(2).withExactText(CVC_EMPTY).exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(3).withExactText(INVALID_NAME).exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(4).withExactText(INVALID_TAX_NUMBER).exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(5).withExactText(PWD_EMPTY).exists)
        .ok();

    // no 7th element
    await t.expect(cardPage.errorPanelEls.nth(6).exists).notOk();

    // Expect focus to be place on Card number field - since SRConfig for this card comp says it should be
    await t.expect(cardPage.numLabelWithFocus.exists).ok();
});

test('#2 Fill out PAN & name and see that first error in error panel is tax number related', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    await cardPage.cardUtils.fillCardNumber(t, KOREAN_TEST_CARD);
    await cardPage.cardUtils.fillDateAndCVC(t);

    await t.typeText(cardPage.holderNameInput, 'j smith');

    // click pay, to validate & generate errors
    await t
        .click(cardPage.payButton)
        // error panel exists
        .expect(cardPage.errorPanelVisible.exists)
        .ok();

    // Expect 2 elements, in order, with specific text
    await t
        .expect(cardPage.errorPanelEls.nth(0).withExactText(INVALID_TAX_NUMBER).exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(1).withExactText(PWD_EMPTY).exists)
        .ok();

    // no 3rd element
    await t.expect(cardPage.errorPanelEls.nth(2).exists).notOk();

    // Expect focus to be place on tax number field
    await t.expect(cardPage.kcpTaxNumberLabelWithFocus.exists).ok();
});
