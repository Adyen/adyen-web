import { test } from '@playwright/test';

test('#1 Click pay with empty fields and error panel is populated', async () => {
    // error panel exists at startup (in its hidden state)
    // Wait for field to appear in DOM
    // click pay, to validate & generate errors
    // Expect 6 elements, in order, with specific text
    // expect(cardPage.errorPanelEls.nth(0).withExactText(CARD_NUMBER_EMPTY).exists)
    // expect(cardPage.errorPanelEls.nth(1).withExactText(EXPIRY_DATE_EMPTY).exists)
    // expect(cardPage.errorPanelEls.nth(2).withExactText(CVC_EMPTY).exists)
    // expect(cardPage.errorPanelEls.nth(3).withExactText(INVALID_NAME).exists)
    // expect(cardPage.errorPanelEls.nth(4).withExactText(INVALID_TAX_NUMBER).exists)
    // expect(cardPage.errorPanelEls.nth(5).withExactText(PWD_EMPTY).exists)
    // no 7th element
    // Expect focus to be place on Card number field - since SRConfig for this card comp says it should be
});

test('#2 Fill out PAN & name and see that first error in error panel is tax number related', async () => {
    // Wait for field to appear in DOM
    // await cardPage.cardUtils.fillCardNumber(t, KOREAN_TEST_CARD, 'paste'); // TODO - shouldn't have to 'paste' here... but Testcafe is being flaky, again!
    // await cardPage.cardUtils.fillDateAndCVC(t);
    // await t.typeText(cardPage.holderNameInput, 'j smith');
    // click pay, to validate & generate errors
    // Expect 2 elements, in order, with specific text
    // expect(cardPage.errorPanelEls.nth(0).withExactText(INVALID_TAX_NUMBER).exists)
    // expect(cardPage.errorPanelEls.nth(1).withExactText(PWD_EMPTY).exists)
    // no 3rd element
    // Expect focus to be place on tax number field
});
