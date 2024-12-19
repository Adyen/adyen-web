import { test, expect } from './dropinWithBcmc.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';

test.describe('Bcmc in dropin', () => {
    test('UI looks as expected with no user interaction', async ({ dropinWithBcmc, bcmc }) => {
        const expectedAltAttributes = ['Bancontact card', 'MasterCard', 'VISA', 'Maestro'];

        await dropinWithBcmc.goto(URL_MAP.dropinWithSession_BCMC_noStoredPms);

        // Check shown card brands in Dropin
        expect(await dropinWithBcmc.visibleCardBrands).toHaveLength(4);

        // Check list of brands
        const visibleBrands = await dropinWithBcmc.visibleCardBrands;

        visibleBrands.forEach((img, index) => {
            expect(img).toHaveAttribute('alt', expectedAltAttributes[index]);
        });

        await dropinWithBcmc.selectPaymentMethod('bcmc');

        await bcmc.isComponentVisible();

        await bcmc.waitForVisibleBrands(1);

        const [firstBrand, secondBrand] = await bcmc.brands;

        // Only a single brand in the PAN input
        expect(firstBrand).toHaveAttribute('alt', /bancontact/i);

        // Hidden Cvc
        await bcmc.getCVCInputInDropin.waitFor({ state: 'hidden' });
    });
});
