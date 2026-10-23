import { test, expect } from '../../../../fixtures/dropin.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { EMI } from '../../../../models/emi';
import {
    API_VERSION,
    EMI_MIN_API_VERSION,
    EMI_PLANS_URL,
    EMI_TEST_CARD,
    EMI_TEST_CARD_PROVIDER,
    PAYMENT_RESULT,
    TEST_CVC_VALUE,
    TEST_DATE_VALUE
} from '../../../utils/constants';

test.skip(API_VERSION < EMI_MIN_API_VERSION, `EMI requires API v${EMI_MIN_API_VERSION} or later`);

test.describe('Dropin - Sessions - EMI', () => {
    test('should load the real plans and complete a payment', async ({ dropinWithSession, page }) => {
        const plansResponsePromise = page.waitForResponse(EMI_PLANS_URL);

        await dropinWithSession.goto(URL_MAP.dropinSessionsIndiaEmi);
        const { paymentMethodDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('emi');

        expect((await plansResponsePromise).status()).toBe(200);

        const emi = new EMI(page, paymentMethodDetailsLocator);
        await emi.isComponentVisible();

        await emi.planSelection.selectProvider(EMI_TEST_CARD_PROVIDER);
        await emi.typeCardNumber(EMI_TEST_CARD);
        await emi.typeExpiryDate(TEST_DATE_VALUE);
        await emi.typeCvc(TEST_CVC_VALUE);
        await emi.pay();

        await expect(dropinWithSession.paymentResult).toContainText(PAYMENT_RESULT.success);
    });
});
