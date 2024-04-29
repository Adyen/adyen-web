import CardComponentPage from '../../_models/CardComponent.page';
import { REGULAR_TEST_CARD, SR_INDICATOR_PREFIX } from '../utils/constants';
import { getInputSelector } from '../../utils/commonUtils';

import LANG from '../../../../lib/src/language/locales/en-US.json';

const CARD_NUMBER_EMPTY = LANG['error.va.sf-cc-num.02'] + SR_INDICATOR_PREFIX;
const EXPIRY_DATE_EMPTY = LANG['error.va.sf-cc-dat.04'] + SR_INDICATOR_PREFIX;
const CVC_EMPTY = LANG['error.va.sf-cc-cvc.01'] + SR_INDICATOR_PREFIX;

const cardPage = new CardComponentPage();

fixture`Testing avsCard's error panel`
    .beforeEach(async t => {
        await t.navigateTo(cardPage.pageUrl);
    })
    .clientScripts('./errorPanel.avsCard.clientScripts.js');

test('#1 avsCard error fields and inputs should have correct aria attributes', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // click pay, to validate & generate errors
    await t.click(cardPage.payButton);

    // Card number's error field should have correct aria attrs (-hidden="true", -live not set)
    await t.expect(cardPage.numErrorText.getAttribute('aria-hidden')).eql('true').expect(cardPage.numErrorText.getAttribute('aria-live')).eql(null);

    // Card number input should have aria-describedby attr
    await t.switchToMainWindow().switchToIframe(cardPage.iframeSelector.nth(0));
    const adb = await getInputSelector('encryptedCardNumber', true).getAttribute('aria-describedby');
    await t.expect(adb).contains('adyen-checkout-encryptedCardNumber-');
    await t.expect(adb).contains('-ariaContext');
    await t.switchToMainWindow();

    // Address input's error field should have correct aria attrs
    await t
        .expect(cardPage.addressLabelErrorText.getAttribute('aria-hidden'))
        .eql(null)
        .expect(cardPage.addressLabelErrorText.getAttribute('aria-live'))
        .eql(null);

    // Address input should have aria-describedby attr
    const adb_address = await cardPage.addressInput.getAttribute('aria-describedby');
    await t.expect(adb_address).contains('adyen-checkout-street-');
    await t.expect(adb_address).contains('-ariaError');
});

test('#2 Click pay with empty fields and error panel in avsCard is populated', async t => {
    // error panel exists at startup
    await t.expect(cardPage.errorPanelVisible.exists).ok();

    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // click pay, to validate & generate errors
    await t.click(cardPage.payButton);

    // await t.debug();

    // Expect 8 elements, with default order & text
    await t
        .expect(cardPage.errorPanelEls.nth(0).withExactText(CARD_NUMBER_EMPTY).exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(1).withExactText(EXPIRY_DATE_EMPTY).exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(2).withExactText(CVC_EMPTY).exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(3).withText('Country/Region:').exists)
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

    await t.wait(500);

    // Expect focus to be place on Card number field - since SRConfig for this card comp says we should move focus
    await t.expect(cardPage.numLabelWithFocus.exists).ok();
});

test('#3 fill out credit card fields & see that first error in error panel is country related', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
    await cardPage.cardUtils.fillDateAndCVC(t);

    // click pay, to validate & generate errors
    await t.click(cardPage.payButton);

    // Expect 5 elements, with default order & text
    await t
        .expect(cardPage.errorPanelEls.nth(0).withText('Country/Region:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(1).withText('Street:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(2).withText('House number:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(3).withText('Postal code:').exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(4).withText('City:').exists)
        .ok();

    // no 6th element
    await t.expect(cardPage.errorPanelEls.nth(5).exists).notOk();

    // Expect focus to be place on country field
    // - focus is move to this field but it seems to be a browser imposed styling rather than a class we add, so it is not possible to test for it
    //    await t.expect(cardPage.countrySelectBtnActive.exists).ok();
});

test('#4 Switch country to US, click pay with empty fields and error panel in avsCard is populated US style', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Opens dropdown
    await t.click(cardPage.countrySelectBtn).expect(cardPage.countrySelectList.hasClass(cardPage.countryListActiveCls)).ok();

    // Click US
    await t.click(cardPage.countrySelectList.child(2));

    // click pay, to validate & generate errors
    await t.click(cardPage.payButton);

    // Expect 7 elements, with order & text specific to the US
    await t
        .expect(cardPage.errorPanelEls.nth(0).withExactText(CARD_NUMBER_EMPTY).exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(1).withExactText(EXPIRY_DATE_EMPTY).exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(2).withExactText(CVC_EMPTY).exists)
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

test('#5 Switch country to US, fill out credit card fields & see that first error in error panel is address related', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Opens dropdown
    await t.click(cardPage.countrySelectBtn).expect(cardPage.countrySelectList.hasClass(cardPage.countryListActiveCls)).ok();

    // Click US
    await t.click(cardPage.countrySelectList.child(2));

    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
    await cardPage.cardUtils.fillDateAndCVC(t);

    // click pay, to validate & generate errors
    await t.click(cardPage.payButton);

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

test('#6 Switch country to UK, click pay with empty fields and error panel in avsCard is populated UK style', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Opens dropdown
    await t.click(cardPage.countrySelectBtn).expect(cardPage.countrySelectList.hasClass(cardPage.countryListActiveCls)).ok();

    // Click UK
    await t.click(cardPage.countrySelectList.child(1));

    // click pay, to validate & generate errors
    await t.click(cardPage.payButton);

    // Expect 7 elements, with order & text specific to the UK
    await t
        .expect(cardPage.errorPanelEls.nth(0).withExactText(CARD_NUMBER_EMPTY).exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(1).withExactText(EXPIRY_DATE_EMPTY).exists)
        .ok()
        .expect(cardPage.errorPanelEls.nth(2).withExactText(CVC_EMPTY).exists)
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

    // Expect focus to be place on Card number field
    await t.expect(cardPage.numLabelWithFocus.exists).ok();
});

test('#7 Switch country to UK, fill out credit card fields & see that first error in error panel is address related', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Opens dropdown
    await t.click(cardPage.countrySelectBtn).expect(cardPage.countrySelectList.hasClass(cardPage.countryListActiveCls)).ok();

    // Click UK
    await t.click(cardPage.countrySelectList.child(1));

    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
    await cardPage.cardUtils.fillDateAndCVC(t);

    // click pay, to validate & generate errors
    await t.click(cardPage.payButton);

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
