import CardComponentPage from '../../_models/CardComponent.page';
import { REGULAR_TEST_CARD } from '../utils/constants';

const cardPage = new CardComponentPage();

fixture.only`Testing card's error panel`
    .beforeEach(async t => {
        await t.navigateTo(cardPage.pageUrl);
    })
    .clientScripts('./errorPanel.avsCard.clientScripts.js');

test('#1 Click pay with empty fields and error panel in avsCard is populated', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // click pay, to validate & generate errors
    await t
        .click(cardPage.payButton)
        // error panel exists
        .expect(cardPage.errorPanelVisible.exists)
        .ok();

    // Expect 8 elements, with default order & text
    await t
        .expect(cardPage.errorPanelEls.nth(0).withText('Card number:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(1).withText('Expiry date:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(2).withText('Security code:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(3).withText('Country:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(4).withText('Street:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(5).withText('House number:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(6).withText('Postal code:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(7).withText('City:').exists)
        .ok();

    // no 9th element
    await t.expect(cardPage.errorPanelEls.nth(8).exists).notOk();

    // Expect focus to be place on Card number field - since SRConfig for this card comp says it should be
    await t.expect(cardPage.numLabelWithFocus.exists).ok();
});

test('#2 Switch country to US, click pay with empty fields and error panel in avsCard is populated US style', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Opens dropdown
    await t
        .click(cardPage.countrySelectBtn)
        .expect(cardPage.countrySelectList.hasClass(cardPage.countryListActiveCls))
        .ok();

    // Click US
    await t.click(cardPage.countrySelectList.child(2));

    // click pay, to validate & generate errors
    await t
        .click(cardPage.payButton)
        // error panel exists
        .expect(cardPage.errorPanelVisible.exists)
        .ok();

    // Expect 7 elements, with order & text specific to the US
    await t
        .expect(cardPage.errorPanelEls.nth(0).withText('Card number:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(1).withText('Expiry date:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(2).withText('Security code:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(3).withText('Address:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(4).withText('City:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(5).withText('State:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(6).withText('Zip code:').exists)
        .ok();

    // no 8th element
    await t.expect(cardPage.errorPanelEls.nth(7).exists).notOk();
});

test('#3 Switch country to US, fill out credit card fields & see that first error in error panel is address related', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Opens dropdown
    await t
        .click(cardPage.countrySelectBtn)
        .expect(cardPage.countrySelectList.hasClass(cardPage.countryListActiveCls))
        .ok();

    // Click US
    await t.click(cardPage.countrySelectList.child(2));

    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
    await cardPage.cardUtils.fillDateAndCVC(t);

    // click pay, to validate & generate errors
    await t
        .click(cardPage.payButton)
        // error panel exists
        .expect(cardPage.errorPanelVisible.exists)
        .ok();

    // Expect 4 elements, with order & text specific to the US
    await t
        .expect(cardPage.errorPanelEls.nth(0).withText('Address:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(1).withText('City:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(2).withText('State:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(3).withText('Zip code:').exists)
        .ok();

    // no 5th element
    await t.expect(cardPage.errorPanelEls.nth(4).exists).notOk();

    // Expect focus to be place on Address field
    await t.expect(cardPage.addressLabelWithFocus.exists).ok();
});

test('#4 Switch country to UK, click pay with empty fields and error panel in avsCard is populated UK style', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Opens dropdown
    await t
        .click(cardPage.countrySelectBtn)
        .expect(cardPage.countrySelectList.hasClass(cardPage.countryListActiveCls))
        .ok();

    // Click UK
    await t.click(cardPage.countrySelectList.child(1));

    // click pay, to validate & generate errors
    await t
        .click(cardPage.payButton)
        // error panel exists
        .expect(cardPage.errorPanelVisible.exists)
        .ok();

    // Expect 7 elements, with order & text specific to the UK
    await t
        .expect(cardPage.errorPanelEls.nth(0).withText('Card number:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(1).withText('Expiry date:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(2).withText('Security code:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(3).withText('House number:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(4).withText('Street:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(5).withText('City / Town:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(6).withText('Postal code:').exists)
        .ok();

    // no 8th element
    await t.expect(cardPage.errorPanelEls.nth(7).exists).notOk();

    // Expect focus to be place on Card number field - since SRConfig for this card comp says it should be
    await t.expect(cardPage.numLabelWithFocus.exists).ok();
});

test('#% Switch country to UK, fill out credit card fields & see that first error in error panel is address related', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Opens dropdown
    await t
        .click(cardPage.countrySelectBtn)
        .expect(cardPage.countrySelectList.hasClass(cardPage.countryListActiveCls))
        .ok();

    // Click UK
    await t.click(cardPage.countrySelectList.child(1));

    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
    await cardPage.cardUtils.fillDateAndCVC(t);

    // click pay, to validate & generate errors
    await t
        .click(cardPage.payButton)
        // error panel exists
        .expect(cardPage.errorPanelVisible.exists)
        .ok();

    // Expect 4 elements, with order & text specific to the US
    await t
        .expect(cardPage.errorPanelEls.nth(0).withText('House number:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(1).withText('Street:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(2).withText('City / Town:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(3).withText('Postal code:').exists)
        .ok();

    // no 5th element
    await t.expect(cardPage.errorPanelEls.nth(4).exists).notOk();

    // Expect focus to be place on House number field
    await t.expect(cardPage.houseNumberLabelWithFocus.exists).ok();
});
