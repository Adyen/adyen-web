import { test, expect } from '../../../fixtures/emi.fixture';
import { URL_MAP } from '../../../fixtures/URL_MAP';
import { emiPlansMock } from '../../../mocks/emiPlans/emiPlans.mock';
import { emiPlansResponseMock } from '../../../mocks/emiPlans/emiPlans.data';
import { API_VERSION, EMI_MIN_API_VERSION, EMI_PLANS, TEST_CVC_VALUE, TEST_DATE_VALUE, VISA_CARD } from '../../utils/constants';

test.beforeEach(async ({ page }) => {
    await emiPlansMock(page, emiPlansResponseMock);
});

test.describe('EMI - CardEmi (native pay button)', () => {
    test('should render the plan selection and the embedded card form with the native pay button', async ({ emi }) => {
        await emi.goto(URL_MAP.emi);

        await expect(emi.planSelection.providerSelect).toBeVisible();
        await expect(emi.planSelection.planSelect).toBeVisible();
        await expect(emi.cardNumberField).toBeVisible();
        await expect(emi.holderNameField).toBeHidden();
        await expect(emi.payButton).toBeVisible();
        await expect(emi.customPayButton).toHaveCount(0);
    });

    // Asserts the request only: the mocked plans don't match the card, so the backend refuses the payment itself
    test('should send the selected plan together with the encrypted card in the payment request', async ({ page, emi }) => {
        test.skip(API_VERSION < EMI_MIN_API_VERSION, `EMI requires API v${EMI_MIN_API_VERSION} or later`);

        const paymentsRequestPromise = page.waitForRequest(request => /\/sessions\/[^/]+\/payments$/.test(new URL(request.url()).pathname));

        await emi.goto(URL_MAP.emi);
        await emi.planSelection.selectProvider(EMI_PLANS.icici.name);

        await emi.typeCardNumber(VISA_CARD);
        await emi.typeExpiryDate(TEST_DATE_VALUE);
        await emi.typeCvc(TEST_CVC_VALUE);
        await emi.pay();

        const { emiPlan, paymentMethod } = (await paymentsRequestPromise).postDataJSON();

        // The first ICICI plan of mocks/emiPlans/emiPlans.data.ts
        expect(emiPlan).toEqual({
            issuerName: 'ICICI',
            fundingSource: 'credit',
            planType: 'LOW_COST',
            tenureMonths: 3,
            interestRateBps: 750,
            appliedOfferIds: ['offer-icici-lowcost']
        });
        expect(paymentMethod).toEqual(
            expect.objectContaining({
                encryptedCardNumber: expect.any(String),
                encryptedExpiryMonth: expect.any(String),
                encryptedExpiryYear: expect.any(String),
                encryptedSecurityCode: expect.any(String)
            })
        );
    });
});

test.describe('EMI - CardEmiWithCustomButton (custom pay button)', () => {
    test('should render the card form without the native pay button and validate on the custom button click', async ({ emi }) => {
        await emi.goto(URL_MAP.emiWithCustomButton);

        await expect(emi.cardNumberField).toBeVisible();
        await expect(emi.customPayButton).toBeVisible();
        await expect(emi.payButton).toHaveCount(0);

        await emi.customPayButton.click();

        await expect(emi.errorFields.first()).toBeVisible();
    });
});
