import { test, expect } from './dropinWithCard.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import { Card } from '../../../../../models/card';

test.describe('Dropin - Card brands displayed in the Payment Method List and underneath the PAN field', () => {
    test('should display the 3 logos and left over amount of brands, and then display all available brands under the PAN field', async ({
        dropinWithCard,
        page
    }) => {
        await dropinWithCard.goto(URL_MAP.dropinWithSession);
        expect(await dropinWithCard.visibleCardBrands).toHaveLength(3);
        expect(dropinWithCard.remainingCardBrandsNumber).toContainText('+11');
        await dropinWithCard.card.scrollIntoViewIfNeeded();
        const { paymentMethodDetailsLocator } = await dropinWithCard.selectNonStoredPaymentMethod('scheme');

        const card = new Card(page, paymentMethodDetailsLocator);
        await card.isComponentVisible();
        expect(await dropinWithCard.visibleCardBrands).toHaveLength(0);
        expect(dropinWithCard.remainingCardBrandsNumber).toBeHidden();
        expect(await card.availableBrands).toHaveLength(14);
    });

    test('should exclude non-valid brands and display only the right amount in the payment header and underneath the PAN field', async ({
        dropinWithCard,
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
        await dropinWithCard.goto(getStoryUrl({ baseUrl: URL_MAP.dropinWithSession, componentConfig: dropinConfig }));
        expect(await dropinWithCard.visibleCardBrands).toHaveLength(3);
        expect(dropinWithCard.remainingCardBrandsNumber).toContainText('+3');
        await dropinWithCard.card.scrollIntoViewIfNeeded();
        const { paymentMethodDetailsLocator } = await dropinWithCard.selectNonStoredPaymentMethod('scheme');

        const card = new Card(page, paymentMethodDetailsLocator);
        await card.isComponentVisible();
        expect(await dropinWithCard.visibleCardBrands).toHaveLength(0);
        expect(dropinWithCard.remainingCardBrandsNumber).toBeHidden();
        expect(await card.availableBrands).toHaveLength(6);
    });
});
