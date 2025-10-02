import { test, expect } from '../../../../fixtures/dropin.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { THREEDS2_MAESTRO_CARD, PAYMENT_RESULT, TEST_CVC_VALUE, THREEDS2_CHALLENGE_PASSWORD } from '../../../utils/constants';
import { Card } from '../../../../models/card';
import { getCardNumberLast4 } from '../../../utils/cards';

test.describe('Stored Maestro card - cvc optional', () => {
    // When user do not fill in the cvc
    test('should make a successful payment without the cvc code', async ({ dropinWithSession, page }) => {
        await dropinWithSession.goto(URL_MAP.dropinWithSession);
        const { paymentMethodDetailsLocator } = await dropinWithSession.selectFirstStoredPaymentMethod('maestro', getCardNumberLast4(THREEDS2_MAESTRO_CARD));

        const card = new Card(page, paymentMethodDetailsLocator);

        await card.cvcInput.waitFor({ state: 'visible' });
        await card.pay({ name: /^Pay/i });
        await card.threeDs2Challenge.fillInPassword(THREEDS2_CHALLENGE_PASSWORD);
        await card.threeDs2Challenge.submit();

        await expect(card.paymentResult).toContainText(PAYMENT_RESULT.success);
    });
    // When user fills in the cvc
    test('should make a successful payment after filling in the correct 3ds challenge password', async ({ dropinWithSession, page }) => {
        await dropinWithSession.goto(URL_MAP.dropinWithSession);
        const { paymentMethodDetailsLocator } = await dropinWithSession.selectFirstStoredPaymentMethod('maestro', getCardNumberLast4(THREEDS2_MAESTRO_CARD));

        const card = new Card(page, paymentMethodDetailsLocator);

        await card.cvcInput.waitFor({ state: 'visible' });
        await card.fillCvc(TEST_CVC_VALUE);
        await card.pay({ name: /^Pay/i });
        await card.threeDs2Challenge.fillInPassword(THREEDS2_CHALLENGE_PASSWORD);
        await card.threeDs2Challenge.submit();

        await expect(card.paymentResult).toContainText(PAYMENT_RESULT.success);
    });

    test('should decline the payment after filling in the wrong 3ds challenge password', async ({ dropinWithSession, page }) => {
        await dropinWithSession.goto(URL_MAP.dropinWithSession);
        const { paymentMethodDetailsLocator } = await dropinWithSession.selectFirstStoredPaymentMethod('maestro', getCardNumberLast4(THREEDS2_MAESTRO_CARD));

        const card = new Card(page, paymentMethodDetailsLocator);

        await card.cvcInput.waitFor({ state: 'visible' });
        await card.fillCvc(TEST_CVC_VALUE);
        await card.pay({ name: /^Pay/i });
        await card.threeDs2Challenge.fillInPassword('dummy');
        await card.threeDs2Challenge.submit();

        await expect(card.paymentResult).toContainText(PAYMENT_RESULT.fail);
    });
});
