import { test, expect } from '../../pages/dropin/dropin.fixture';

test.describe('Dropin', () => {
    test('should select highlighted issuer and update pay button label', async ({ dropinPage_cardBrands_defaultView }) => {
        const { dropin, page } = dropinPage_cardBrands_defaultView;

        await dropin.isComponentVisible();

        const creditCard = dropin.getPaymentMethodItem('Credit Card');
        await creditCard.scrollIntoViewIfNeeded();

        const brandsHolder = creditCard.locator('.adyen-checkout__payment-method__brands');

        const imgCount = await brandsHolder.getByRole('img').count();

        await expect(imgCount).toEqual(10);
    });
});
