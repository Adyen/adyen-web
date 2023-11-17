import { test, expect } from '../../pages/dropin/dropin.fixture';

test.describe('Dropin', () => {
    test('should select highlighted issuer and update pay button label', async ({ dropinPage }) => {
        const { dropin, page } = dropinPage;

        await dropin.isComponentVisible();

        // await page.waitForTimeout(5000);

        await dropin.creditCard.scrollIntoViewIfNeeded();

        const imgCount = await dropin.brandsHolder.getByRole('img').count();

        await expect(imgCount).toEqual(10);

        // const creditCard = dropin.getPaymentMethodItem('Credit Card');
        // await creditCard.scrollIntoViewIfNeeded();
        //
        // const brandsHolder = creditCard.locator('.adyen-checkout__payment-method__brands');
        //
        // const imgCount = await brandsHolder.getByRole('img').count();
        //
        // await expect(imgCount).toEqual(10);
    });
});
