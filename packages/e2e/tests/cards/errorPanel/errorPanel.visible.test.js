import CardComponentPage from '../../_models/CardComponent.page';
import { REGULAR_TEST_CARD } from '../utils/constants';

const cardPage = new CardComponentPage();

fixture`Testing card's error panel`
    .beforeEach(async t => {
        await t.navigateTo(cardPage.pageUrl);
    })
    .clientScripts('./errorPanel.visible.clientScripts.js');

test('#1 Error panel is not present at start, when there are no errors', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // error panel does not exist
    await t.expect(cardPage.errorPanelVisible.exists).notOk();
});

test('#2 Click pay with empty fields and error panel is populated', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // click pay, to validate & generate errors
    await t
        .click(cardPage.payButton)
        // error panel exists
        .expect(cardPage.errorPanelVisible.exists)
        .ok();

    // Expect 3 elements, in order, with specific text
    await t
        .expect(cardPage.errorPanelEls.nth(0).withText('Card number:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(1).withText('Expiry date:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(2).withText('Security code:').exists)
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
    await t
        .click(cardPage.payButton)
        // error panel exists
        .expect(cardPage.errorPanelVisible.exists)
        .ok();

    // Expect 2 elements, in order, with specific text
    await t
        .expect(cardPage.errorPanelEls.nth(0).withText('Expiry date:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(1).withText('Security code:').exists)
        .ok();

    // no 3rd element
    await t.expect(cardPage.errorPanelEls.nth(2).exists).notOk();

    // Expect focus to be place on Expiry date field
    await t.expect(cardPage.dateLabelWithFocus.exists).ok();
});
