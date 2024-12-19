import { cardInDropin as test, expect } from '../../../../fixtures/dropin.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { PAYMENT_RESULT, TEST_CVC_VALUE } from '../../../utils/constants';
import { getStoryUrl } from '../../../utils/getStoryUrl';

test.describe('Stored visa card - cvc required', () => {
    test('#1 Can fill out the cvc fields in the stored card and make a successful payment', async ({ dropinWithSession, card }) => {
        await dropinWithSession.goto(URL_MAP.dropinWithSession);
        await dropinWithSession.selectFirstStoredPaymentMethod('Visa', '1111');
        await card.cvcInput.waitFor({ state: 'visible' });
        await card.fillCvc(TEST_CVC_VALUE);
        await card.pay({ name: /pay \$259\.00/i });
        await expect(card.paymentResult).toContainText(PAYMENT_RESULT.success);
    });

    test('#2 Pressing pay without filling the cvc should generate a translated error ("empty")', async ({ dropinWithSession, card }) => {
        await dropinWithSession.goto(URL_MAP.dropinWithSession);
        await dropinWithSession.selectFirstStoredPaymentMethod('Visa', '1111');
        await card.cvcInput.waitFor({ state: 'visible' });
        await card.pay({ name: /pay \$259\.00/i });
        await expect(card.cvcErrorElement).toContainText('Enter the security code');
    });

    test('#3 A storedCard with no expiry date field still can be used for a successful payment', async ({ dropinWithSession, card }) => {
        const url = getStoryUrl({
            baseUrl: URL_MAP.dropinWithSession,
            componentConfig: {
                paymentMethodsConfiguration: {
                    storedCard: { expiryMonth: null, expiryYear: null }
                }
            }
        });
        await dropinWithSession.goto(url);
        await dropinWithSession.selectFirstStoredPaymentMethod('Visa', '1111');
        await card.cvcInput.waitFor({ state: 'visible' });
        await card.fillCvc(TEST_CVC_VALUE);
        await card.pay({ name: /pay \$259\.00/i });
        await expect(card.paymentResult).toContainText(PAYMENT_RESULT.success);
    });
});
