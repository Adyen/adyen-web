import { test, expect } from '../../../pages/dropin/dropin.fixture';

test.describe('Dropin: How Credit Card brand logos display with "showBrandsUnderCardNumber" set to its default, true', () => {
    test('#1 A truncated list of brands show up on the Card Payment Method', async ({ dropinPage_cardBrands_compactView }) => {
        const { dropin, page } = dropinPage_cardBrands_compactView;

        await dropin.isComponentVisible();

        const creditCard = dropin.getPaymentMethodItem('Credit Card');
        await creditCard.scrollIntoViewIfNeeded();

        const brandsHolder = creditCard.locator('.adyen-checkout__payment-method__brands');

        const imgCount = await brandsHolder.getByRole('img').count();

        const brandsText = brandsHolder.locator('.adyen-checkout__payment-method__brand-number');

        await expect(brandsHolder).toBeVisible();

        await expect(imgCount).toEqual(3);

        await expect(brandsText).toBeVisible();
        await expect(brandsText).toHaveText('+7');
    });

    test('#2 After clicking on the Card PaymentMethodItem, the brands disappear from the header and show beneath Card Number', async ({
        dropinPage_cardBrands_compactView
    }) => {
        const { dropin, page } = dropinPage_cardBrands_compactView;

        await dropin.isComponentVisible();

        const creditCard = dropin.getPaymentMethodItem('Credit Card');
        await creditCard.scrollIntoViewIfNeeded();

        await creditCard.click();

        const brandsHolder = creditCard.locator('.adyen-checkout__payment-method__brands');

        const brandsText = brandsHolder.locator('.adyen-checkout__payment-method__brand-number');

        await expect(brandsHolder).not.toBeVisible();
        await expect(brandsText).not.toBeVisible();

        // Brands inside actual Credit Card component
        const componentBrandsHolder = creditCard.locator('.adyen-checkout__card__brands');
        const imgCount = await componentBrandsHolder.getByRole('img').count();

        await expect(imgCount).toEqual(10);
    });
});
