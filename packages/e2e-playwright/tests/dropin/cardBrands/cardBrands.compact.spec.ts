import { test, expect } from '../../../pages/dropin/dropin.fixture';
import { getCreditCardPM } from '../../../models/dropinModelUtils/getDropinCardComp';

test.describe('Dropin: How Credit Card brand logos display with "showBrandsUnderCardNumber" set to its default, true', () => {
    test('#1 A truncated list of brands show up on the Card Payment Method', async ({ dropinPage_cardBrands_compactView }) => {
        const { dropin, page } = dropinPage_cardBrands_compactView;

        await dropin.isComponentVisible();

        const creditCard = getCreditCardPM(dropin);
        await creditCard.pm.scrollIntoViewIfNeeded();

        const imgCount = await creditCard.getImageCount(creditCard.brandsHolder);

        await expect(creditCard.brandsHolder).toBeVisible();

        await expect(imgCount).toEqual(3);

        await expect(creditCard.brandsText).toBeVisible();
        await expect(creditCard.brandsText).toHaveText('+7');
    });

    test('#2 After clicking on the Card PaymentMethodItem, the brands disappear from the header and show beneath Card Number', async ({
        dropinPage_cardBrands_compactView
    }) => {
        const { dropin, page } = dropinPage_cardBrands_compactView;

        await dropin.isComponentVisible();

        const creditCard = getCreditCardPM(dropin);
        await creditCard.pm.scrollIntoViewIfNeeded();

        await creditCard.pm.click();

        await expect(creditCard.brandsHolder).not.toBeVisible();
        await expect(creditCard.brandsText).not.toBeVisible();

        // Brands inside actual Credit Card component
        const imgCount = await creditCard.getImageCount(creditCard.componentBrandsHolder);

        await expect(imgCount).toEqual(10);
    });
});
