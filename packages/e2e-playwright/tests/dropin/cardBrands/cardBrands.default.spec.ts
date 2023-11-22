import { test, expect } from '../../../pages/dropin/dropin.fixture';

test.describe('Dropin: How Credit Card brand logos display with "showBrandsUnderCardNumber" equals false', () => {
    test('#1 All available brands show up on the Card PaymentMethodItem', async ({ dropinPage_cardBrands_defaultView }) => {
        const { dropin, page } = dropinPage_cardBrands_defaultView;

        await dropin.isComponentVisible();

        const creditCard = dropin.getPaymentMethodItem('Credit Card');
        await creditCard.scrollIntoViewIfNeeded();

        const brandsHolder = creditCard.locator('.adyen-checkout__payment-method__brands');

        const imgCount = await brandsHolder.getByRole('img').count();

        const brandsText = brandsHolder.locator('.adyen-checkout__payment-method__brand-number');

        await expect(brandsHolder).toBeVisible();

        await expect(imgCount).toEqual(10);

        await expect(brandsText).not.toBeVisible();
    });

    test('#2 All available brands are kept in the Card PaymentMethodItem after clicking on it', async ({ dropinPage_cardBrands_defaultView }) => {
        const { dropin, page } = dropinPage_cardBrands_defaultView;

        await dropin.isComponentVisible();

        const creditCard = dropin.getPaymentMethodItem('Credit Card');
        await creditCard.scrollIntoViewIfNeeded();

        await creditCard.click();

        const brandsHolder = creditCard.locator('.adyen-checkout__payment-method__brands');

        const imgCount = await brandsHolder.getByRole('img').count();

        await expect(brandsHolder).toBeVisible();

        await expect(imgCount).toEqual(10);

        // Brands inside actual Credit Card component
        const componentBrandsHolder = creditCard.locator('.adyen-checkout__card__brands');

        await expect(componentBrandsHolder).not.toBeVisible();
    });
});
