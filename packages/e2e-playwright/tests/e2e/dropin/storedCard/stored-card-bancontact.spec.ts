import { test, expect } from '../../../../fixtures/dropin.fixture';
import { PAYMENT_RESULT, THREEDS2_CHALLENGE_PASSWORD } from '../../../utils/constants';
import { BCMC } from '../../../../models/bcmc';

const BCMC_URL = '/iframe.html?args=countryCode:BE&globals=&id=dropin-default--auto&viewMode=story';

test.describe('Stored Bancontact card', () => {
    test('should make a successful payment', async ({ dropinWithSession, page }) => {
        await dropinWithSession.goto(BCMC_URL);
        const { paymentMethodDetailsLocator } = await dropinWithSession.selectFirstStoredPaymentMethod('bcmc', '4449');

        const bcmc = new BCMC(page, paymentMethodDetailsLocator);

        await bcmc.pay({ name: /pay €259\.00/i });
        await bcmc.threeDs2Challenge.fillInPassword(THREEDS2_CHALLENGE_PASSWORD);
        await bcmc.threeDs2Challenge.submit();

        await expect(bcmc.paymentResult).toContainText(PAYMENT_RESULT.fail);
    });
});
