import { test } from '@playwright/test';

test.describe('Stored Maestro card - cvc optional', () => {
    // When user do not fill in the cvc
    test('should make a successful payment without the cvc code', async () => {});
    // When user fills in the cvc
    test('should make a successful payment after filling in the correct 3ds challenge password', async () => {});
    test('should decline the payment after filling in the wrong 3ds challenge password', async () => {});
});
