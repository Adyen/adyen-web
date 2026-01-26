import { test, expect } from '../../../../fixtures/dropin.fixture';
import { BCMC_CARD, PAYMENT_RESULT, THREEDS2_CHALLENGE_PASSWORD } from '../../../utils/constants';
import { BCMC } from '../../../../models/bcmc';
import { getCardNumberLast4 } from '../../../utils/cards';

const BCMC_URL = '/iframe.html?args=countryCode:BE&globals=&id=drop-in-drop-in-component--default&viewMode=story';

test.describe('Stored Bancontact card', () => {
    test('should make a successful payment', async ({ dropinWithSession, page }) => {
        await dropinWithSession.goto(BCMC_URL);
        const { paymentMethodDetailsLocator } = await dropinWithSession.selectFirstStoredPaymentMethod('bcmc', getCardNumberLast4(BCMC_CARD));

        const bcmc = new BCMC(page, paymentMethodDetailsLocator);

        await bcmc.pay({ name: /pay €259\.00/i });
        await bcmc.threeDs2Challenge.fillInPassword(THREEDS2_CHALLENGE_PASSWORD);

        await bcmc.threeDs2Challenge.submit();

        await expect(bcmc.paymentResult).toContainText(PAYMENT_RESULT.success);
    });

    test('should decline the payment after filling in the wrong 3ds challenge password', async ({ dropinWithSession, page }) => {
        await dropinWithSession.goto(BCMC_URL);
        const { paymentMethodDetailsLocator } = await dropinWithSession.selectFirstStoredPaymentMethod('bcmc', getCardNumberLast4(BCMC_CARD));

        const bcmc = new BCMC(page, paymentMethodDetailsLocator);

        await bcmc.pay({ name: /pay €259\.00/i });
        await bcmc.threeDs2Challenge.fillInPassword('dummy');

        await bcmc.threeDs2Challenge.submit();

        await expect(bcmc.paymentResult).toContainText(PAYMENT_RESULT.fail);
    });
});
