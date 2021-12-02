import CardComponentPage from '../../_models/CardComponent.page';
import { KOREAN_TEST_CARD } from '../utils/constants';

const cardPage = new CardComponentPage();

fixture`Testing kcpCard, with holderName, error panel`
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
        .expect(cardPage.errorPanelEls.nth(0).withText('Card number:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(1).withText('Expiry date:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(2).withText('Security code:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(3).withText('Name on card:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(4).withText('Cardholder birthdate').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(5).withText('First 2 digits').exists)
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
        .expect(cardPage.errorPanelEls.nth(0).withText('Cardholder birthdate').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(1).withText('First 2 digits').exists)
        .ok();

    // no 3rd element
    await t.expect(cardPage.errorPanelEls.nth(2).exists).notOk();

    // Expect focus to be place on Expiry date field
    await t.expect(cardPage.kcpTaxNumberLabelWithFocus.exists).ok();
});
