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

import LANG from '../../../../../server/translations/en-US.json';
import { binLookupMock } from '../../../../mocks/binLookup/binLookup.mock';
import {
    bcmcOnly,
    dualBcmcAndMaestro,
    dualBrandedBcmcAndMc,
    dualBrandedBcmcAndVisa,
    dualBrandedMcAndBcmc,
    dualBrandedVisaAndBcmc
} from '../../../../mocks/binLookup/binLookup.data';
const CVC_LABEL_OPTIONAL = LANG['creditCard.securityCode.label.optional'];

test.describe('Bcmc payments with dual branding', () => {
    test.describe('Bancontact (BCMC) / Maestro brands', () => {
        test('#1 should submit the bcmc payment selecting Bancontact', async ({ bcmc, page }) => {
            await bcmc.goto(URL_MAP.bcmc);
            await bcmc.isComponentVisible();

            await bcmc.typeCardNumber(BCMC_CARD);
            await bcmc.typeExpiryDate(TEST_DATE_VALUE);

            await expect(bcmc.isDualBrandSelectionVisible()).resolves.toBe(true);
            await expect(bcmc.getBrandOptionCount()).resolves.toBe(2);

            await bcmc.selectBrand(/bancontact/i);

            await expect(bcmc.cvcField).toBeHidden();

            const paymentsRequestPromise = page.waitForRequest(request => request.url().includes('/payments') && request.method() === 'POST');
            await bcmc.pay();

            const request = await paymentsRequestPromise;
            const paymentMethod = await request.postDataJSON().paymentMethod;
            expect(paymentMethod.brand).toEqual('bcmc');

            await bcmc.threeDs2Challenge.fillInPassword(THREEDS2_CHALLENGE_PASSWORD);
            await bcmc.threeDs2Challenge.submit();
            await expect(bcmc.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });

        test('#2 should submit the maestro payment', async ({ bcmc, page }) => {
            await binLookupMock(page, dualBcmcAndMaestro);

            await bcmc.goto(URL_MAP.bcmc);
            await bcmc.isComponentVisible();

            await bcmc.typeCardNumber(BCMC_CARD);
            await bcmc.typeExpiryDate(TEST_DATE_VALUE);
            await expect(bcmc.isDualBrandSelectionVisible()).resolves.toBe(true);

            await bcmc.selectBrand(/maestro/i);

            await expect(bcmc.cvcLabelText).toHaveText(CVC_LABEL_OPTIONAL);

            const paymentsRequestPromise = page.waitForRequest(request => request.url().includes('/payments') && request.method() === 'POST');
            await bcmc.pay();

            const request = await paymentsRequestPromise;
            const paymentMethod = await request.postDataJSON().paymentMethod;
            expect(paymentMethod.brand).toEqual('maestro');

            await expect(bcmc.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });
    });

    test.describe('Bancontact (BCMC) / Visa Debit brands', () => {
        test('#3 should submit the bcmc payment (without needing to fill CVC field)', async ({ bcmc, page }) => {
            await binLookupMock(page, dualBrandedVisaAndBcmc);

            await bcmc.goto(URL_MAP.bcmc);
            await bcmc.isComponentVisible();

            await bcmc.typeCardNumber(BCMC_DUAL_BRANDED_VISA);
            await bcmc.typeExpiryDate(TEST_DATE_VALUE);
            await expect(bcmc.isDualBrandSelectionVisible()).resolves.toBe(true);
            await expect(bcmc.getBrandOptionCount()).resolves.toBe(2);

            await bcmc.selectBrand(/bancontact/i);

            await bcmc.pay();
            await bcmc.threeDs2Challenge.fillInPassword(THREEDS2_CHALLENGE_PASSWORD);
            await bcmc.threeDs2Challenge.submit();
            await expect(bcmc.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });

        test('#4 should submit the visa payment', async ({ bcmc, page }) => {
            await binLookupMock(page, dualBrandedBcmcAndVisa);

            await bcmc.goto(URL_MAP.bcmc);
            await bcmc.isComponentVisible();

            await bcmc.typeCardNumber(BCMC_DUAL_BRANDED_VISA);
            await bcmc.typeExpiryDate(TEST_DATE_VALUE);
            await expect(bcmc.isDualBrandSelectionVisible()).resolves.toBe(true);

            await bcmc.selectBrand(/visa/i);
            await expect(bcmc.cvcField).toBeVisible();

            await bcmc.fillCvc(TEST_CVC_VALUE);

            const paymentsRequestPromise = page.waitForRequest(request => request.url().includes('/payments') && request.method() === 'POST');
            await bcmc.pay();

            const request = await paymentsRequestPromise;
            const paymentMethod = await request.postDataJSON().paymentMethod;
            expect(paymentMethod.brand).toEqual('visa');

            await bcmc.threeDs2Challenge.fillInPassword(THREEDS2_CHALLENGE_PASSWORD);
            await bcmc.threeDs2Challenge.submit();
            await expect(bcmc.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });
    });

    test.describe('Bancontact (BCMC) / MC brands', () => {
        test('#5 should submit the bcmc payment', async ({ bcmc, page }) => {
            await binLookupMock(page, dualBrandedMcAndBcmc);

            await bcmc.goto(URL_MAP.bcmc);
            await bcmc.isComponentVisible();

            await bcmc.typeCardNumber(BCMC_DUAL_BRANDED_MC);
            await bcmc.typeExpiryDate(TEST_DATE_VALUE);
            await expect(bcmc.isDualBrandSelectionVisible()).resolves.toBe(true);
            await expect(bcmc.getBrandOptionCount()).resolves.toBe(2);

            await bcmc.selectBrand(/bancontact/i);

            await bcmc.pay();

            await expect(bcmc.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });

        test('#6 should submit the mc payment', async ({ bcmc, page }) => {
            await binLookupMock(page, dualBrandedBcmcAndMc);

            await bcmc.goto(URL_MAP.bcmc);
            await bcmc.isComponentVisible();

            await bcmc.typeCardNumber(BCMC_DUAL_BRANDED_MC);
            await bcmc.typeExpiryDate(TEST_DATE_VALUE);

            await expect(bcmc.isDualBrandSelectionVisible()).resolves.toBe(true);

            await bcmc.selectBrand(/mastercard/i);

            await expect(bcmc.cvcField).toBeVisible();

            await bcmc.fillCvc(TEST_CVC_VALUE);

            const paymentsRequestPromise = page.waitForRequest(request => request.url().includes('/payments') && request.method() === 'POST');
            await bcmc.pay();

            const request = await paymentsRequestPromise;
            const paymentMethod = await request.postDataJSON().paymentMethod;
            expect(paymentMethod.brand).toEqual('mc');

            await expect(bcmc.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });
    });

    test('#7 should submit payment branded to a default value after clearing and retyping PAN', async ({ bcmc, page }) => {
        await binLookupMock(page, dualBrandedBcmcAndMc);

        await bcmc.goto(URL_MAP.bcmc);
        await bcmc.isComponentVisible();

        await bcmc.typeCardNumber(BCMC_DUAL_BRANDED_MC);
        await bcmc.typeExpiryDate(TEST_DATE_VALUE);

        await expect(bcmc.isDualBrandSelectionVisible()).resolves.toBe(true);

        await bcmc.selectBrand(/mastercard/i);

        await expect(bcmc.cvcField).toBeVisible();

        await bcmc.fillCvc(TEST_CVC_VALUE);

        await bcmc.deleteCardNumber();
        await bcmc.typeCardNumber(BCMC_DUAL_BRANDED_MC);

        await expect(bcmc.isDualBrandSelectionVisible()).resolves.toBe(true);

        const paymentsRequestPromise = page.waitForRequest(request => request.url().includes('/payments') && request.method() === 'POST');
        await bcmc.pay();

        const request = await paymentsRequestPromise;
        const paymentMethod = await request.postDataJSON().paymentMethod;
        expect(paymentMethod.brand).not.toBeUndefined();

        await expect(bcmc.paymentResult).toContainText(PAYMENT_RESULT.authorised);
    });

    test.describe('Form validation', () => {
        test('should not submit with incomplete form data (missing expiry date)', async ({ bcmc }) => {
            await bcmc.goto(URL_MAP.bcmc);
            await bcmc.isComponentVisible();
            await bcmc.typeCardNumber(BCMC_CARD);

            await bcmc.pay();

            await expect(bcmc.expiryDateErrorElement).toHaveText(/Enter the (complete )?expiry date/);
        });

        test('should not submit with invalid card number', async ({ bcmc, page }) => {
            await binLookupMock(page, bcmcOnly);
            await bcmc.goto(URL_MAP.bcmc);
            await bcmc.isComponentVisible();
            await bcmc.fillCardNumber(`${BCMC_CARD}111`);

            await bcmc.pay();

            await expect(bcmc.cardNumberErrorElement).toHaveText('Enter a valid card number');
        });

        test('should not submit non-bcmc brand without CVC', async ({ bcmc, page }) => {
            await binLookupMock(page, dualBrandedBcmcAndVisa);

            await bcmc.goto(URL_MAP.bcmc);
            await bcmc.isComponentVisible();

            await bcmc.typeCardNumber(BCMC_DUAL_BRANDED_VISA);
            await bcmc.typeExpiryDate(TEST_DATE_VALUE);
            await expect(bcmc.isDualBrandSelectionVisible()).resolves.toBe(true);

            await bcmc.selectBrand(/visa/i);
            await expect(bcmc.cvcField).toBeVisible();

            await bcmc.pay();

            await expect(bcmc.cvcErrorElement).toHaveText('Enter the security code');
        });
    });
});
