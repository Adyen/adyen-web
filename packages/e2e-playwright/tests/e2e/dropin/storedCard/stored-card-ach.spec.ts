import { mergeTests, expect } from '@playwright/test';
import { test as dropin } from '../../../../fixtures/dropin.fixture';
import { test as ach } from '../../../../fixtures/ach.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { PAYMENT_RESULT } from '../../../utils/constants';

const test = mergeTests(dropin, ach);

test.describe('Stored ach card', () => {
    test('should make a successful payment', async ({ dropinWithSession, ach }) => {
        const lastFourDigits = '3123';
        await dropinWithSession.goto(URL_MAP.dropinWithSession);
        await dropinWithSession.selectFirstStoredPaymentMethod('ach', lastFourDigits);
        await ach.payWithStoredCard(lastFourDigits);
        await ach.paymentResult.waitFor({ state: 'visible' });
        await expect(ach.paymentResult).toContainText(PAYMENT_RESULT.success);
    });
});
