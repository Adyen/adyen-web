import { test, expect } from '../../../../fixtures/card.fixture';
import {
    BCMC_CARD,
    BCMC_DUAL_BRANDED_MC,
    BCMC_DUAL_BRANDED_VISA,
    PAYMENT_RESULT,
    TEST_CVC_VALUE,
    TEST_DATE_VALUE,
    THREEDS2_CHALLENGE_PASSWORD
} from '../../../utils/constants';
import { URL_MAP } from '../../../../fixtures/URL_MAP';

test.describe('Bcmc payments with dual branding', () => {
    test.describe('Bancontact (BCMC) / Maestro brands', () => {
        test.describe('Selecting the Bancontact brand', () => {
            test('#1a should submit the bcmc payment', async ({ bcmc, page }) => {
                const paymentsRequestPromise = page.waitForRequest(request => request.url().includes('/payments') && request.method() === 'POST');

                await bcmc.goto(URL_MAP.bcmc);

                await bcmc.isComponentVisible();

                await bcmc.fillCardNumber(BCMC_CARD);
                await bcmc.fillExpiryDate(TEST_DATE_VALUE);
                await bcmc.waitForVisibleBrands();

                const [firstBrand, secondBrand] = await bcmc.brands;
                expect(firstBrand).toHaveAttribute('data-value', 'bcmc');
                expect(secondBrand).toHaveAttribute('data-value', 'maestro');

                await bcmc.selectBrand('Bancontact card');
                await bcmc.pay();

                // check brand has been set in paymentMethod data
                const request = await paymentsRequestPromise;
                const paymentMethod = await request.postDataJSON().paymentMethod;
                expect(paymentMethod.brand).toEqual('bcmc');

                await bcmc.threeDs2Challenge.fillInPassword(THREEDS2_CHALLENGE_PASSWORD);
                await bcmc.threeDs2Challenge.submit();
                await expect(bcmc.paymentResult).toContainText(PAYMENT_RESULT.authorised);
            });

            test('#1b should not submit the bcmc payment with incomplete form data', async ({ bcmc }) => {
                await bcmc.goto(URL_MAP.bcmc);
                await bcmc.isComponentVisible();
                await bcmc.fillCardNumber(BCMC_CARD);
                await bcmc.waitForVisibleBrands();
                await bcmc.selectBrand('Bancontact card');
                await bcmc.pay();

                await expect(bcmc.expiryDateErrorElement).toHaveText('Enter the expiry date');
            });

            test('#1c should not submit the bcmc payment with invalid bcmc card number', async ({ bcmc }) => {
                await bcmc.goto(URL_MAP.bcmc);
                await bcmc.isComponentVisible();
                await bcmc.fillCardNumber(`${BCMC_CARD}111`);
                await bcmc.pay();

                await expect(bcmc.cardNumberErrorElement).toHaveText('Enter a valid card number');
            });
        });

        test.describe('Selecting the maestro brand', () => {
            test('#2a should submit the maestro payment', async ({ bcmc, page }) => {
                const paymentsRequestPromise = page.waitForRequest(request => request.url().includes('/payments') && request.method() === 'POST');

                await bcmc.goto(URL_MAP.bcmc);
                await bcmc.isComponentVisible();

                await bcmc.fillCardNumber(BCMC_CARD);
                await bcmc.fillExpiryDate(TEST_DATE_VALUE);
                await bcmc.waitForVisibleBrands();

                const [firstBrand, secondBrand] = await bcmc.brands;
                expect(firstBrand).toHaveAttribute('data-value', 'bcmc');
                expect(secondBrand).toHaveAttribute('data-value', 'maestro');

                await bcmc.selectBrand('Maestro');
                await bcmc.pay();

                const request = await paymentsRequestPromise;
                const paymentMethod = await request.postDataJSON().paymentMethod;
                expect(paymentMethod.brand).toEqual('maestro');

                await expect(bcmc.paymentResult).toContainText(PAYMENT_RESULT.authorised);
            });

            test('#2b should not submit the maestro payment with incomplete form data', async ({ bcmc }) => {
                await bcmc.goto(URL_MAP.bcmc);
                await bcmc.isComponentVisible();
                await bcmc.fillCardNumber(BCMC_CARD);
                await bcmc.waitForVisibleBrands();
                await bcmc.selectBrand('Maestro');
                await bcmc.pay();

                await expect(bcmc.expiryDateErrorElement).toHaveText('Enter the expiry date');
            });

            test('#2c should not submit the maestro payment with invalid maestro card number', async ({ bcmc }) => {
                await bcmc.goto(URL_MAP.bcmc);
                await bcmc.isComponentVisible();
                await bcmc.fillCardNumber(`${BCMC_CARD}111`);
                await bcmc.pay();

                await expect(bcmc.expiryDateErrorElement).toHaveText('Enter the expiry date');
            });
        });
    });

    test.describe('Bancontact (BCMC) / Visa Debit brands', () => {
        test.describe('Selecting the Bancontact brand', () => {
            test('#3a should submit the bcmc payment (without needing to fill CVC field)', async ({ bcmc }) => {
                await bcmc.goto(URL_MAP.bcmc);
                await bcmc.isComponentVisible();

                await bcmc.fillCardNumber(BCMC_DUAL_BRANDED_VISA);
                await bcmc.fillExpiryDate(TEST_DATE_VALUE);
                await bcmc.waitForVisibleBrands();

                const [firstBrand, secondBrand] = await bcmc.brands;
                expect(firstBrand).toHaveAttribute('data-value', 'bcmc');
                expect(secondBrand).toHaveAttribute('data-value', 'visa');

                await bcmc.selectBrand('Bancontact card');
                await bcmc.pay();
                await bcmc.threeDs2Challenge.fillInPassword(THREEDS2_CHALLENGE_PASSWORD);
                await bcmc.threeDs2Challenge.submit();
                await expect(bcmc.paymentResult).toContainText(PAYMENT_RESULT.authorised);
            });

            test('#3b should not submit the bcmc payment with incomplete form data', async ({ bcmc }) => {
                await bcmc.goto(URL_MAP.bcmc);
                await bcmc.isComponentVisible();
                await bcmc.fillCardNumber(BCMC_DUAL_BRANDED_VISA);
                await bcmc.waitForVisibleBrands();
                await bcmc.selectBrand('Bancontact card');
                await bcmc.pay();

                await expect(bcmc.expiryDateErrorElement).toHaveText('Enter the expiry date');
            });

            test('#3c should not submit the bcmc payment with invalid bcmc card number', async ({ bcmc }) => {
                await bcmc.goto(URL_MAP.bcmc);
                await bcmc.isComponentVisible();
                await bcmc.fillCardNumber(`${BCMC_DUAL_BRANDED_VISA}111`);
                await bcmc.pay();

                await expect(bcmc.cardNumberErrorElement).toHaveText('Enter a valid card number');
            });
        });

        test.describe('Selecting the visa brand', () => {
            test('#4a should submit the visa payment', async ({ bcmc, page }) => {
                const paymentsRequestPromise = page.waitForRequest(request => request.url().includes('/payments') && request.method() === 'POST');

                await bcmc.goto(URL_MAP.bcmc);
                await bcmc.isComponentVisible();

                await bcmc.fillCardNumber(BCMC_DUAL_BRANDED_VISA);
                await bcmc.fillExpiryDate(TEST_DATE_VALUE);
                await bcmc.waitForVisibleBrands();

                const [firstBrand, secondBrand] = await bcmc.brands;
                expect(firstBrand).toHaveAttribute('data-value', 'bcmc');
                expect(secondBrand).toHaveAttribute('data-value', 'visa');

                await bcmc.selectBrand(/visa/i);
                await bcmc.fillCvc(TEST_CVC_VALUE);
                await bcmc.pay();

                const request = await paymentsRequestPromise;
                const paymentMethod = await request.postDataJSON().paymentMethod;
                expect(paymentMethod.brand).toEqual('visa');

                await bcmc.threeDs2Challenge.fillInPassword(THREEDS2_CHALLENGE_PASSWORD);
                await bcmc.threeDs2Challenge.submit();
                await expect(bcmc.paymentResult).toContainText(PAYMENT_RESULT.authorised);
            });

            test('#4b should not submit the visa payment with incomplete form data', async ({ bcmc }) => {
                await bcmc.goto(URL_MAP.bcmc);
                await bcmc.isComponentVisible();

                await bcmc.fillCardNumber(BCMC_DUAL_BRANDED_VISA);
                await bcmc.fillExpiryDate(TEST_DATE_VALUE);
                await bcmc.waitForVisibleBrands();

                await bcmc.selectBrand(/visa/i);
                await bcmc.pay();

                await expect(bcmc.cvcErrorElement).toHaveText('Enter the security code');
            });

            test('#4c should not submit the visa payment with invalid visa card number', async ({ bcmc }) => {
                await bcmc.goto(URL_MAP.bcmc);
                await bcmc.isComponentVisible();
                await bcmc.fillCardNumber(`${BCMC_DUAL_BRANDED_VISA}111`);
                await bcmc.pay();

                await expect(bcmc.cardNumberErrorElement).toHaveText('Enter a valid card number');
            });
        });
    });

    test.describe('Bancontact (BCMC) / MC brands', () => {
        test.describe('Selecting the Bancontact brand', () => {
            test('#5a should submit the bcmc payment', async ({ bcmc }) => {
                await bcmc.goto(URL_MAP.bcmc);
                await bcmc.isComponentVisible();

                await bcmc.fillCardNumber(BCMC_DUAL_BRANDED_MC);
                await bcmc.fillExpiryDate(TEST_DATE_VALUE);
                await bcmc.waitForVisibleBrands();

                const [firstBrand, secondBrand] = await bcmc.brands;
                expect(firstBrand).toHaveAttribute('data-value', 'bcmc');
                expect(secondBrand).toHaveAttribute('data-value', 'mc');

                await bcmc.selectBrand('Bancontact card');
                await bcmc.pay();

                await expect(bcmc.paymentResult).toContainText(PAYMENT_RESULT.authorised);
            });

            test('#5b should not submit the bcmc payment with incomplete form data', async ({ bcmc }) => {
                await bcmc.goto(URL_MAP.bcmc);
                await bcmc.isComponentVisible();
                await bcmc.fillCardNumber(BCMC_DUAL_BRANDED_MC);
                await bcmc.waitForVisibleBrands();
                await bcmc.selectBrand('Bancontact card');
                await bcmc.pay();

                await expect(bcmc.expiryDateErrorElement).toHaveText('Enter the expiry date');
            });

            test('#5c should not submit the bcmc payment with invalid bcmc card number', async ({ bcmc }) => {
                await bcmc.goto(URL_MAP.bcmc);
                await bcmc.isComponentVisible();
                await bcmc.fillCardNumber(`${BCMC_DUAL_BRANDED_MC}111`);
                await bcmc.pay();

                await expect(bcmc.cardNumberErrorElement).toHaveText('Enter a valid card number');
            });
        });

        test.describe('Selecting the mc brand', () => {
            test('#6a should submit the mc payment', async ({ bcmc, page }) => {
                const paymentsRequestPromise = page.waitForRequest(request => request.url().includes('/payments') && request.method() === 'POST');

                await bcmc.goto(URL_MAP.bcmc);
                await bcmc.isComponentVisible();

                await bcmc.fillCardNumber(BCMC_DUAL_BRANDED_MC);
                await bcmc.fillExpiryDate(TEST_DATE_VALUE);
                await bcmc.waitForVisibleBrands();

                const [firstBrand, secondBrand] = await bcmc.brands;
                expect(firstBrand).toHaveAttribute('data-value', 'bcmc');
                expect(secondBrand).toHaveAttribute('data-value', 'mc');

                await bcmc.selectBrand('MasterCard');
                await bcmc.fillCvc(TEST_CVC_VALUE);
                await bcmc.pay();

                const request = await paymentsRequestPromise;
                const paymentMethod = await request.postDataJSON().paymentMethod;
                expect(paymentMethod.brand).toEqual('mc');

                await expect(bcmc.paymentResult).toContainText(PAYMENT_RESULT.authorised);
            });

            test('#6b should not submit the mc payment with incomplete form data', async ({ bcmc }) => {
                await bcmc.goto(URL_MAP.bcmc);
                await bcmc.isComponentVisible();

                await bcmc.fillCardNumber(BCMC_DUAL_BRANDED_MC);
                await bcmc.fillExpiryDate(TEST_DATE_VALUE);
                await bcmc.waitForVisibleBrands();

                await bcmc.selectBrand('MasterCard');
                await bcmc.pay();

                await expect(bcmc.cvcErrorElement).toHaveText('Enter the security code');
            });

            test('#6c should not submit the mc payment with invalid mc card number', async ({ bcmc }) => {
                await bcmc.goto(URL_MAP.bcmc);
                await bcmc.isComponentVisible();
                await bcmc.fillCardNumber(`${BCMC_DUAL_BRANDED_MC}111`);
                await bcmc.pay();

                await expect(bcmc.cardNumberErrorElement).toHaveText('Enter a valid card number');
            });
        });
    });
    test.describe('Selecting the mc brand', () => {
        test.describe('Then deleting the PAN and retyping it without selecting a brand', () => {
            test('#7 should submit a non-branded payment payment', async ({ bcmc, page }) => {
                const paymentsRequestPromise = page.waitForRequest(request => request.url().includes('/payments') && request.method() === 'POST');

                await bcmc.goto(URL_MAP.bcmc);
                await bcmc.isComponentVisible();

                await bcmc.fillCardNumber(BCMC_DUAL_BRANDED_MC);
                await bcmc.fillExpiryDate(TEST_DATE_VALUE);
                await bcmc.waitForVisibleBrands();

                const [firstBrand, secondBrand] = await bcmc.brands;
                expect(firstBrand).toHaveAttribute('data-value', 'bcmc');
                expect(secondBrand).toHaveAttribute('data-value', 'mc');

                await bcmc.selectBrand('MasterCard');
                await bcmc.fillCvc(TEST_CVC_VALUE);

                await bcmc.deleteCardNumber();
                await bcmc.fillCardNumber(BCMC_DUAL_BRANDED_MC);

                await bcmc.pay();

                const request = await paymentsRequestPromise;
                const paymentMethod = await request.postDataJSON().paymentMethod;
                expect(paymentMethod.brand).toBeUndefined();

                await expect(bcmc.paymentResult).toContainText(PAYMENT_RESULT.authorised);
            });
        });
    });
});
