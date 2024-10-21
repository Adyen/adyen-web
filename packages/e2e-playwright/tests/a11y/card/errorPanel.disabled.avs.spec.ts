import { test } from '@playwright/test';

test('#1 avsCard error fields and inputs should have correct aria attributes', async () => {
    // error panel does not exist at startup
    // Wait for field to appear in DOM
    // click pay, to validate & generate errors
    // PAN's error field should have correct aria attrs
    // PAN input should have aria-describedby attr
    // Address input's error field should have correct aria attrs
    // expect(cardPage.addressLabelErrorText.getAttribute('aria-live'))
    // expect(cardPage.addressLabelErrorText.getAttribute('aria-hidden'))
    // Address should have aria-describedby attr & it should equals the error field's id
});
