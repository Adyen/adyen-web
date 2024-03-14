import { test, expect } from '../../../pages/dropin/dropin.fixture';
import { getCreditCardPM_withBrandsInfo } from '../../../models/dropinModelUtils/utils';

test.describe('Dropin - Card brands displayed in the Payment Method List and underneath the PAN field', () => {
    test('should display the 3 logos and left over amount of brands, and then display all available brands under the PAN field', async ({
        dropinPage_cardBrands
    }) => {
        const { dropin, page } = dropinPage_cardBrands;

        await dropin.isComponentVisible();

        const creditCard = getCreditCardPM_withBrandsInfo(dropin);
        await creditCard.pm.scrollIntoViewIfNeeded();
        const imgCount = await creditCard.getImageCount(creditCard.brandsHolder);

        /**
         * Display the right amount in the payment method header
         */
        await expect(creditCard.brandsHolder).toBeVisible();
        await expect(imgCount).toEqual(3);
        await expect(creditCard.brandsText).toBeVisible();
        await expect(creditCard.brandsText).toHaveText('+7');

        /**
         * When clicking in the Component, it displays the right amount underneath the card number field
         */
        await creditCard.pm.click();

        await expect(creditCard.brandsHolder).not.toBeVisible();
        await expect(creditCard.brandsText).not.toBeVisible();

        // Brands inside actual Credit Card component
        const brandsInsideCardComponent = await creditCard.getImageCount(creditCard.componentBrandsHolder);
        await expect(brandsInsideCardComponent).toEqual(10);
    });

    test('should exclude non-valid brands and display only the right amount in the payment header and underneath the PAN field', async ({
        dropinPage_cardBrands_withExcluded
    }) => {
        const { dropin, page } = dropinPage_cardBrands_withExcluded;

        await dropin.isComponentVisible();

        const creditCard = getCreditCardPM_withBrandsInfo(dropin);
        await creditCard.pm.scrollIntoViewIfNeeded();
        const imgCount = await creditCard.getImageCount(creditCard.brandsHolder);

        /**
         * Display the right amount in the payment method header
         */
        await expect(creditCard.brandsHolder).toBeVisible();
        await expect(imgCount).toEqual(3);
        await expect(creditCard.brandsText).toBeVisible();
        await expect(creditCard.brandsText).toHaveText('+3');

        /**
         * When clicking in the Component, it displays the right amount underneath the card number field
         */
        await creditCard.pm.click();

        await expect(creditCard.brandsHolder).not.toBeVisible();
        await expect(creditCard.brandsText).not.toBeVisible();

        // Brands inside actual Credit Card component
        const brandsInsideCardComponent = await creditCard.getImageCount(creditCard.componentBrandsHolder);
        await expect(brandsInsideCardComponent).toEqual(6);
    });
});
