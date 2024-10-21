import { test } from '@playwright/test';

test('#1 Error panel is present at start, when there are no errors, but is empty', async () => {
    // Wait for field to appear in DOM
    // error panel exists but is empty
});

test('#2 Click pay with empty fields and error panel is populated', async () => {
    // Wait for field to appear in DOM
    // click pay, to validate & generate errors
    // Expect 3 elements, in order, with specific text
    // expect(cardPage.errorPanelEls.nth(0).withExactText(CARD_NUMBER_EMPTY).exists)
    // expect(cardPage.errorPanelEls.nth(1).withExactText(EXPIRY_DATE_EMPTY).exists)
    // expect(cardPage.errorPanelEls.nth(2).withExactText(CVC_EMPTY).exists)
    // no 4th element
    // Expect focus to be place on Card number field - since SRConfig for this card comp says it should be
});

test('#3 Fill out PAN & see that first error in error panel is date related', async () => {
    // Wait for field to appear in DOM
    // await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
    // click pay, to validate & generate errors
    // Expect 2 elements, in order, with specific text
    // expect(cardPage.errorPanelEls.nth(0).withExactText(EXPIRY_DATE_EMPTY).exists)
    // expect(cardPage.errorPanelEls.nth(1).withExactText(CVC_EMPTY).exists)
    // no 3rd element
    // Expect focus to be place on Expiry date field
});
