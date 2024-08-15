import { test } from '../../../fixtures/openInvoices.fixture';
test('should make a Ratepay payment', async () => {
    // Fill in the form data
    // Check the consent checkbox
    // Submit the payment
    // Expect success payment
});

test('should not submit a Ratepay payment if the form in not valid', async () => {
    // Fill in the wrong form data
    // Click pay button
    // Expect error
});

test('should not submit a Ratepay payment if the consent checkbox is not checked', async () => {
    // Fill in the wrong form data
    // Click pay button
    // Expect error
});
