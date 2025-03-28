import dotenv from 'dotenv';
import { expect } from '@playwright/test';
import { test } from '../../../../fixtures/dropin.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { PAYMENT_RESULT } from '../../../utils/constants';
import Ach from '../../../../models/ach';

dotenv.config();
const apiVersion = Number(process.env.API_VERSION.substring(1));

test.describe('Stored ach card', () => {
    test('should make a successful payment', async ({ dropinWithSession, page }) => {
        test.skip(apiVersion === 69, 'Skipping test for api version 69');

        const lastFourDigits = '3123';
        await dropinWithSession.goto(URL_MAP.dropinWithSession);
        const { paymentMethodDetailsLocator } = await dropinWithSession.selectFirstStoredPaymentMethod('ach', lastFourDigits);

        const ach = new Ach(page, paymentMethodDetailsLocator);

        await ach.payWithStoredCard(lastFourDigits);
        await ach.paymentResult.waitFor({ state: 'visible' });
        await expect(ach.paymentResult).toContainText(PAYMENT_RESULT.success);
    });
});
