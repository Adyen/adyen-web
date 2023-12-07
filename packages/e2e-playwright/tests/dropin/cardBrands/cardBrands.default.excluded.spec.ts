import { test, expect } from '../../../pages/dropin/dropin.fixture';
import { getCreditCardPM } from '../../../models/dropinModelUtils/getDropinCardComp';

test.describe('Dropin: How Credit Card brand logos display with "showBrandsUnderCardNumber" equals false when "excluded" brands exists', () => {
    test('#1 Only a subset of brands show up on the Card PaymentMethodItem', async ({ dropinPage_cardBrands_defaultView_withExcluded }) => {
        const { dropin, page } = dropinPage_cardBrands_defaultView_withExcluded;

        await dropin.isComponentVisible();

        const creditCard = getCreditCardPM(dropin);
        await creditCard.pm.scrollIntoViewIfNeeded();

        const imgCount = await creditCard.getImageCount(creditCard.brandsHolder);

        await expect(creditCard.brandsHolder).toBeVisible();

        await expect(imgCount).toEqual(6);

        await expect(creditCard.brandsText).not.toBeVisible();
    });

    test('#2 Only a subset of brands are kept in the Card PaymentMethodItem after clicking on it', async ({
        dropinPage_cardBrands_defaultView_withExcluded
    }) => {
        const { dropin, page } = dropinPage_cardBrands_defaultView_withExcluded;

        await dropin.isComponentVisible();

        const creditCard = getCreditCardPM(dropin);
        await creditCard.pm.scrollIntoViewIfNeeded();

        await creditCard.pm.click();

        const imgCount = await creditCard.getImageCount(creditCard.brandsHolder);

        await expect(creditCard.brandsHolder).toBeVisible();

        await expect(imgCount).toEqual(6);

        // Brands inside actual Credit Card component
        await expect(creditCard.componentBrandsHolder).not.toBeVisible();
    });
});
