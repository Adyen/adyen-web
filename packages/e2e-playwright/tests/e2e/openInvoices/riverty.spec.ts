import { test } from '../../../fixtures/openInvoices.fixture';

test.describe('Test Riverty Component', () => {
    test('should make a Riverty payment', async () => {
        // Fill in the form data
        // Check the consent checkbox
        // Submit the payment
        // Expect success payment
    });

    test('should not submit a Riverty payment if the form in not valid', async () => {
        // Fill in the wrong form data
        // Click pay button
        // Expect error
    });

    test('should not submit a Riverty payment if the consent checkbox is not checked', async () => {
        // Fill in the wrong form data
        // Click pay button
        // Expect error
    });
});
