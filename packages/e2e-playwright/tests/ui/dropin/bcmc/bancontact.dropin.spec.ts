import { test, expect } from '../../../../fixtures/dropin.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { BCMC } from '../../../../models/bcmc';

test.describe('Bcmc in dropin', () => {
    test('UI looks as expected with no user interaction', async ({ dropinWithSession, page }) => {
        const expectedAltAttributes = ['Bancontact card', 'MasterCard', 'VISA', 'Maestro'];

        await dropinWithSession.goto(URL_MAP.dropinWithSession_BCMC_noStoredPms);

        const header = await dropinWithSession.getPaymentMethodHeader('Bancontact card');
        const brands = await header.getVisibleCardBrands();

        expect(brands).toHaveLength(4);
        brands.forEach((img, index) => {
            expect(img).toHaveAttribute('alt', expectedAltAttributes[index]);
        });

        const { paymentMethodDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('bcmc');

        const bcmc = new BCMC(page, paymentMethodDetailsLocator);

        await bcmc.isComponentVisible();
        await bcmc.waitForVisibleBrands(1);

        const [firstBrand, secondBrand] = await bcmc.brands;
        // Only a single brand in the PAN input
        expect(firstBrand).toHaveAttribute('alt', /bancontact/i);

        // Hidden Cvc
        await expect(bcmc.cvcField).toBeHidden();
    });
});
