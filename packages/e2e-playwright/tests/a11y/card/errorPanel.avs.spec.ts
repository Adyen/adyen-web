import { test } from '@playwright/test';

test('#1 avsCard error fields and inputs should have correct aria attributes', async () => {
    // Wait for field to appear in DOM
    // click pay, to validate & generate errors
    // Card number's error field should have correct aria attrs (-hidden="true", -live not set)
    // Card number input should have aria-describedby attr
    // Address input's error field should have correct aria attrs
    // Address input should have aria-describedby attr
});

test('#2 Click pay with empty fields and error panel in avsCard is populated', async () => {
    // error panel exists at startup
    // Wait for field to appear in DOM
    // click pay, to validate & generate errors
    // Expect 8 elements in the sr panel, with default order & text
    // expect(cardPage.errorPanelEls.nth(0).withExactText(CARD_NUMBER_EMPTY).exists)
    // expect(cardPage.errorPanelEls.nth(1).withExactText(EXPIRY_DATE_EMPTY).exists)
    // expect(cardPage.errorPanelEls.nth(2).withExactText(CVC_EMPTY).exists)
    // expect(cardPage.errorPanelEls.nth(3).withExactText(`Enter the Country/Region${SR_INDICATOR_PREFIX}`).exists)
    // expect(cardPage.errorPanelEls.nth(4).withExactText(`Enter the Street${SR_INDICATOR_PREFIX}`).exists)
    // expect(cardPage.errorPanelEls.nth(5).withExactText(`Enter the House number${SR_INDICATOR_PREFIX}`).exists)
    // expect(cardPage.errorPanelEls.nth(6).withExactText(`Enter the Postal code${SR_INDICATOR_PREFIX}`).exists)
    // expect(cardPage.errorPanelEls.nth(7).withExactText(`Enter the City${SR_INDICATOR_PREFIX}`).exists)
    // no 9th element?
    // Expect focus to be place on Card number field - since SRConfig for this card comp says we should move focus
});

test('#3 fill out credit card fields & see that first error in error panel is country related', async () => {
    // Wait for field to appear in DOM
    //await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
    //await cardPage.cardUtils.fillDateAndCVC(t);
    // click pay, to validate & generate errors
    // Expect 5 elements, with default order & text
    //expect(cardPage.errorPanelEls.nth(0).withExactText(`Enter the Country/Region${SR_INDICATOR_PREFIX}`).exists)
    //expect(cardPage.errorPanelEls.nth(1).withExactText(`Enter the Street${SR_INDICATOR_PREFIX}`).exists)
    //expect(cardPage.errorPanelEls.nth(2).withExactText(`Enter the House number${SR_INDICATOR_PREFIX}`).exists)
    //expect(cardPage.errorPanelEls.nth(3).withExactText(`Enter the Postal code${SR_INDICATOR_PREFIX}`).exists)
    //expect(cardPage.errorPanelEls.nth(4).withExactText(`Enter the City${SR_INDICATOR_PREFIX}`).exists)
    // no 6th element
    // Expect focus to be place on country field
    // - focus is move to this field but it seems to be a browser imposed styling rather than a class we add, so it is not possible to test for it
    //    await t.expect(cardPage.countrySelectBtnActive.exists).ok();
});

test('#4 Switch country to US, click pay with empty fields and error panel in avsCard is populated US style', async () => {
    // Wait for field to appear in DOM
    // Opens dropdown
    // Click US
    // click pay, to validate & generate errors
    // Expect 7 elements, with order & text specific to the US
    //expect(cardPage.errorPanelEls.nth(0).withExactText(CARD_NUMBER_EMPTY).exists)
    //expect(cardPage.errorPanelEls.nth(1).withExactText(EXPIRY_DATE_EMPTY).exists)
    //expect(cardPage.errorPanelEls.nth(2).withExactText(CVC_EMPTY).exists)
    //expect(cardPage.errorPanelEls.nth(3).withExactText(`Enter the Address${SR_INDICATOR_PREFIX}`).exists)
    //expect(cardPage.errorPanelEls.nth(4).withExactText(`Enter the City${SR_INDICATOR_PREFIX}`).exists)
    //expect(cardPage.errorPanelEls.nth(5).withExactText(`Enter the State${SR_INDICATOR_PREFIX}`).exists)
    //expect(cardPage.errorPanelEls.nth(6).withExactText(`Enter the Zip code${SR_INDICATOR_PREFIX}`).exists)
    // no 8th element
});

test('#5 Switch country to US, fill out credit card fields & see that first error in error panel is address related', async () => {
    // Wait for field to appear in DOM
    // Opens dropdown
    // Click US
    //await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
    //await cardPage.cardUtils.fillDateAndCVC(t);
    // click pay, to validate & generate errors
    // Expect 4 elements, with order & text specific to the US
    //expect(cardPage.errorPanelEls.nth(0).withExactText(`Enter the Address${SR_INDICATOR_PREFIX}`).exists)
    //expect(cardPage.errorPanelEls.nth(1).withExactText(`Enter the City${SR_INDICATOR_PREFIX}`).exists)
    //expect(cardPage.errorPanelEls.nth(2).withExactText(`Enter the State${SR_INDICATOR_PREFIX}`).exists)
    //expect(cardPage.errorPanelEls.nth(3).withExactText(`Enter the Zip code${SR_INDICATOR_PREFIX}`).exists)
    // no 5th element
    // Expect focus to be place on Address field
});

test('#6 Switch country to UK, click pay with empty fields and error panel in avsCard is populated UK style', async () => {
    // Wait for field to appear in DOM
    // Opens country dropdown
    // Click UK
    // click pay, to validate & generate errors
    // Expect 7 elements, with order & text specific to the UK
    //expect(cardPage.errorPanelEls.nth(0).withExactText(CARD_NUMBER_EMPTY).exists)
    //expect(cardPage.errorPanelEls.nth(1).withExactText(EXPIRY_DATE_EMPTY).exists)
    //expect(cardPage.errorPanelEls.nth(2).withExactText(CVC_EMPTY).exists)
    //expect(cardPage.errorPanelEls.nth(3).withExactText(`Enter the House number${SR_INDICATOR_PREFIX}`).exists)
    //expect(cardPage.errorPanelEls.nth(4).withExactText(`Enter the Street${SR_INDICATOR_PREFIX}`).exists)
    //expect(cardPage.errorPanelEls.nth(5).withExactText(`Enter the City / Town${SR_INDICATOR_PREFIX}`).exists)
    //expect(cardPage.errorPanelEls.nth(6).withExactText(`Enter the Postal code${SR_INDICATOR_PREFIX}`).exists)
    // no 8th element
    // Expect focus to be place on Card number field
});

test('#7 Switch country to UK, fill out credit card fields & see that first error in error panel is address related', async () => {
    // Wait for field to appear in DOM
    // Opens dropdown
    // Click UK
    //await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
    //await cardPage.cardUtils.fillDateAndCVC(t);
    // click pay, to validate & generate errors
    // Expect 4 elements, with order & text specific to the US
    //expect(cardPage.errorPanelEls.nth(0).withExactText(`Enter the House number${SR_INDICATOR_PREFIX}`).exists)
    //expect(cardPage.errorPanelEls.nth(1).withExactText(`Enter the Street${SR_INDICATOR_PREFIX}`).exists)
    //expect(cardPage.errorPanelEls.nth(2).withExactText(`Enter the City / Town${SR_INDICATOR_PREFIX}`).exists)
    //expect(cardPage.errorPanelEls.nth(3).withExactText(`Enter the Postal code${SR_INDICATOR_PREFIX}`).exists)
    // no 5th element
    // Expect focus to be place on House number field
});
