import { test } from '@playwright/test';

test('#1 Click pay with empty fields and hidden error panel is populated', async () => {
    // error panel exists at startup but is not visible
    // Wait for field to appear in DOM
    // click pay, to validate & generate errors
    // error panel exists but is not visible
    // Expect 4 elements, in order, with specific text
    // expect(cardPage.errorPanelEls.nth(0).withExactText(INVALID_NAME).exists)
    // expect(cardPage.errorPanelEls.nth(1).withExactText(CARD_NUMBER_EMPTY).exists)
    // expect(cardPage.errorPanelEls.nth(2).withExactText(EXPIRY_DATE_EMPTY).exists)
    // expect(cardPage.errorPanelEls.nth(3).withExactText(CVC_EMPTY).exists)
    // no 5th element
    // Expect focus not to be place on holder name field - since SRConfig for this card comp says it shouldn't be
});
