import { test as base, expect } from '../../../fixtures/base-fixture';
import { EMI } from '../../../models/emi';
import { URL_MAP } from '../../../fixtures/URL_MAP';
import { emiPlansMock } from '../../../mocks/emiPlans/emiPlans.mock';
import { emiPlansEmptyResponseMock, emiPlansResponseMock } from '../../../../lib/src/components/EMI/stories/mocks';
import { EMI_PLANS } from '../../utils/constants';

type Fixture = {
    emiPage: EMI;
};

const test = base.extend<Fixture>({
    emiPage: async ({ page }, use) => {
        await use(new EMI(page));
    }
});

const { hdfc, icici } = EMI_PLANS;

test.describe('EMI - plan selection', () => {
    test.beforeEach(async ({ page, emiPage }) => {
        await emiPlansMock(page, emiPlansResponseMock);
        await emiPage.goto(URL_MAP.emi);
    });

    test('should expose both selects by their accessible name, inside the two named sections', async ({ emiPage, page }) => {
        const { planSelection } = emiPage;

        await expect(planSelection.providerSelect).toBeVisible();
        await expect(planSelection.planSelect).toBeVisible();

        const planGroup = page.getByRole('group', { name: 'EMI plan' });
        await expect(planGroup.getByRole('combobox', { name: 'Provider' })).toBeVisible();
        await expect(planGroup.getByRole('combobox', { name: 'Plan' })).toBeVisible();
        await expect(page.getByRole('group', { name: 'Plan summary' })).toBeVisible();
    });

    test('should list only the plans of the selected provider', async ({ emiPage }) => {
        const planOptions = await emiPage.planSelection.openPlanList();

        await expect(planOptions).toHaveCount(2);
        await expect(planOptions.first()).toHaveText(hdfc.firstPlan);
        await expect(planOptions.last()).toHaveText(hdfc.secondPlan);
    });

    test('should offer every provider the lookup returned', async ({ emiPage }) => {
        const providerOptions = await emiPage.planSelection.openProviderList();

        await expect(providerOptions).toHaveCount(4);
    });

    test('should preselect the first provider and its first plan, with the summary already filled in', async ({ emiPage }) => {
        const { planSelection } = emiPage;

        await expect(planSelection.providerSelect).toContainText(hdfc.name);
        await expect(planSelection.planSelect).toContainText(hdfc.firstPlan);

        await expect(planSelection.summaryLabels).toContainText([/Item price/, /Discount/, /Amount reserved on card/, /Interest charged by bank/]);

        // The item price is the transaction amount rather than plan data, so it must match what the shopper is asked to pay
        const itemPrice = await planSelection.summaryValues.first().innerText();
        await expect(emiPage.page.getByRole('button', { name: /pay/i })).toContainText(itemPrice);
    });

    test('should reset the plan to the first plan of a newly selected provider, and update the summary', async ({ emiPage }) => {
        const { planSelection } = emiPage;

        await planSelection.selectPlan(hdfc.secondPlan);
        await expect(planSelection.planSelect).toContainText(hdfc.secondPlan);

        await planSelection.selectProvider(icici.name);

        await expect(planSelection.providerSelect).toContainText(icici.name);
        await expect(planSelection.planSelect).toContainText(icici.firstPlan);
        await expect(planSelection.summaryLabels).toContainText([/Interest charged by bank @7.5%/]);
    });

    // The provider tag advertises what the bank offers, so an untagged plan cannot take it away
    test('should keep the tag of the provider while one of its untagged plans is selected', async ({ emiPage }) => {
        const { planSelection } = emiPage;

        await planSelection.selectProvider(icici.name);
        await expect(planSelection.providerSelect).toContainText(icici.tag);

        await planSelection.selectPlan(icici.secondPlan);

        await expect(planSelection.planSelect).not.toContainText(icici.tag);
        await expect(planSelection.providerSelect).toContainText(icici.tag);
    });

    test('should show the discount banner only while a discounted plan is selected', async ({ emiPage }) => {
        const { planSelection } = emiPage;

        await expect(planSelection.discountBanner).toContainText(`-₹4,000.00 discount offer applied for using ${EMI_PLANS.discountedProvider}`);

        await planSelection.selectPlan(hdfc.secondPlan);

        await expect(planSelection.discountBanner).toBeHidden();
    });

    test('should keep the card form below the plan selection', async ({ emiPage }) => {
        await expect(emiPage.cardNumberField).toBeVisible();
        await expect(emiPage.page.getByRole('button', { name: /pay/i })).toBeVisible();
    });
});

test.describe('EMI - without plans', () => {
    // `isAvailable()` rejects, which the story container reports instead of mounting the component
    const expectNoEmi = async (emiPage: EMI) => {
        await emiPage.page.goto(URL_MAP.emi);

        await expect(emiPage.page.getByText(/No installment plans available/i)).toBeVisible();
        await expect(emiPage.planSelection.providerSelect).toHaveCount(0);
        await expect(emiPage.page.getByRole('form')).toHaveCount(0);
    };

    test('should offer no EMI when the lookup returns no plan', async ({ page, emiPage }) => {
        await emiPlansMock(page, emiPlansEmptyResponseMock);

        await expectNoEmi(emiPage);
    });

    test('should offer no EMI when the lookup fails', async ({ page, emiPage }) => {
        await emiPlansMock(page, { status: 500, errorCode: '000', message: 'Internal error' }, 500);

        await expectNoEmi(emiPage);
    });
});
