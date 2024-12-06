import { mergeTests, expect, test as base } from '@playwright/test';
import { test as dropin } from '../../../../fixtures/dropin.fixture';
import { PAYMENT_RESULT, THREEDS2_CHALLENGE_PASSWORD } from '../../../utils/constants';
import { BCMC } from '../../../../models/bcmc';

type Fixture = {
    bcmc: BCMC;
};

const test = mergeTests(
    dropin,
    base.extend<Fixture>({
        bcmc: async ({ page }, use) => {
            const bcmc = new BCMC(page);
            await use(bcmc);
        }
    })
);

test.describe('Stored Bancontact card', () => {
    test('should make a successful payment', async ({ dropinWithSession, bcmc }) => {
        const url = '/iframe.html?args=countryCode:BE&globals=&id=dropin-default--auto&viewMode=story';
        await dropinWithSession.goto(url);
        await dropinWithSession.selectFirstStoredPaymentMethod('bcmc', '4449');
        await bcmc.pay({ name: /pay €259\.00/i });
        await bcmc.threeDs2Challenge.fillInPassword(THREEDS2_CHALLENGE_PASSWORD);
        await bcmc.threeDs2Challenge.submit();

        await expect(bcmc.paymentResult).toContainText(PAYMENT_RESULT.fail);
    });
});
