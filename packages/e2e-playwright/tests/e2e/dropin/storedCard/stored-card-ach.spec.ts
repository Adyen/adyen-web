import { mergeTests, expect } from '@playwright/test';
import { test as dropin } from '../../../../fixtures/dropin.fixture';

const test = mergeTests(dropin);
test.describe('Stored ach card', () => {
    test('should make a successful payment', async () => {
        // One click, pay button
    });
});
