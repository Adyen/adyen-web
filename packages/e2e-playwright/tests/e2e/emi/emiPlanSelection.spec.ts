import { test, expect } from '../../../fixtures/emi.fixture';
import { URL_MAP } from '../../../fixtures/URL_MAP';
import { emiPlansMock } from '../../../mocks/emiPlans/emiPlans.mock';
import { emiPlansErrorResponseMock, emiPlansResponseMock } from '../../../mocks/emiPlans/emiPlans.data';
import { EMI_PLANS, EMI_PLANS_URL } from '../../utils/constants';

const { hdfc, icici } = EMI_PLANS;

test.describe('EMI - plan selection', () => {
    test('should keep the selects and the summary in step while the shopper picks a plan', async ({ page, emi }) => {
        const { planSelection } = emi;

        await emiPlansMock(page, emiPlansResponseMock);
        await emi.goto(URL_MAP.emi);

        await expect(planSelection.providerSelect).toContainText(hdfc.name);
        await expect(planSelection.planSelect).toContainText(hdfc.firstPlan);
        await expect(planSelection.summaryLabels).toContainText([
            /Item price/,
            /Instant discount/,
            /Interest discount/,
            /Amount reserved on card/,
            /Interest charged by bank/
        ]);
        // The interest discount is tagged with the plan type whose offer buys the interest down
        await expect(planSelection.summaryLabels.filter({ hasText: /Interest discount/ })).toContainText('No cost');

        const planOptions = await planSelection.openPlanList();
        await expect(planOptions).toHaveCount(2);
        await planOptions.filter({ hasText: hdfc.secondPlan }).click();

        await expect(planSelection.planSelect).toContainText(hdfc.secondPlan);

        await planSelection.selectProvider(icici.name);

        await expect(planSelection.providerSelect).toContainText(icici.name);
        await expect(planSelection.planSelect).toContainText(icici.firstPlan);
        await expect(planSelection.summaryLabels).toContainText([/Interest charged by bank @7.5%/]);
    });
});

test.describe('EMI - without plans', () => {
    // Per ADR-0004 EMI keeps its spinner and renders nothing else when the lookup yields no plan
    test('should offer no EMI when the lookup fails', async ({ page, emi }) => {
        await emiPlansMock(page, emiPlansErrorResponseMock, emiPlansErrorResponseMock.status);
        const plansResponsePromise = page.waitForResponse(EMI_PLANS_URL);

        await page.goto(URL_MAP.emi);
        await plansResponsePromise;

        await expect(emi.spinner).toBeVisible();
        await expect(emi.loadingAnnouncement).toBeAttached();
        await expect(emi.planSelection.providerSelect).toHaveCount(0);
        await expect(emi.cardNumberField).toHaveCount(0);
        await expect(emi.payButton).toHaveCount(0);
    });
});
