import { test, expect } from '../../../../fixtures/dropin.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { BCMC } from '../../../../models/bcmc';

test.describe('Bcmc in dropin', () => {
    test('UI looks as expected with no user interaction', async ({ dropinWithSession, page }) => {
        await dropinWithSession.goto(URL_MAP.dropinWithSession_BCMC_noStoredPms);

        const { paymentMethodDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('bcmc');

        const bcmc = new BCMC(page, paymentMethodDetailsLocator);

        await bcmc.isComponentVisible();
        await bcmc.waitForVisibleDualBrandIcons(1);

        const [firstBrand, secondBrand] = await bcmc.dualBrandIcons;
        // Only a single brand in the PAN input
        expect(firstBrand).toHaveAttribute('alt', /bancontact/i);

        // Hidden Cvc
        await expect(bcmc.cvcField).toBeHidden();
    });
});
