import { test, expect } from '../../../../../fixtures/dropin.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import { Card } from '../../../../../models/card';

test.describe('Dropin - Card brands displayed in the Payment Method List and underneath the PAN field', () => {
    test('should display the 3 logos and left over amount of brands, and then display all available brands under the PAN field', async ({
        dropinWithSession,
        page
    }) => {
        await dropinWithSession.goto(URL_MAP.dropinWithSession);

        const header = await dropinWithSession.getPaymentMethodHeader('Cards');
        await header.rootElement.scrollIntoViewIfNeeded();

        const brands = await header.getVisibleCardBrands();
        expect(brands).toHaveLength(3);

        const remainingBrandsText = await header.getRemainingBrandsNumberText();
        expect(remainingBrandsText).toBe('+11');

        const { paymentMethodDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');

        const card = new Card(page, paymentMethodDetailsLocator);
        await card.isComponentVisible();

        expect(await header.getVisibleCardBrands()).toHaveLength(0);
        await expect(await header.getRemainingBrandsNumberLocator()).toHaveCount(0);
        expect(await card.availableBrands).toHaveLength(14);
    });

    test('should exclude non-valid brands and display only the right amount in the payment header and underneath the PAN field', async ({
        dropinWithSession,
        page
    }) => {
        const dropinConfig = {
            paymentMethodsConfiguration: {
                card: {
                    brands: ['visa', 'mc', 'amex', 'discover', 'cup', 'maestro', 'nyce', 'accel', 'star', 'pulse'],
                    _disableClickToPay: true
                }
            }
        };
        await dropinWithSession.goto(getStoryUrl({ baseUrl: URL_MAP.dropinWithSession, componentConfig: dropinConfig }));

        const header = await dropinWithSession.getPaymentMethodHeader('Cards');
        await header.rootElement.scrollIntoViewIfNeeded();

        const brands = await header.getVisibleCardBrands();
        expect(brands).toHaveLength(3);

        const { paymentMethodDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');

        const card = new Card(page, paymentMethodDetailsLocator);

        await card.isComponentVisible();

        expect(await header.getVisibleCardBrands()).toHaveLength(0);
        await expect(await header.getRemainingBrandsNumberLocator()).toHaveCount(0);
        expect(await card.availableBrands).toHaveLength(6);
    });
});
