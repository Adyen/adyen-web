import { test, expect } from '../../../fixtures/emi.fixture';
import { URL_MAP } from '../../../fixtures/URL_MAP';
import { emiPlansMock } from '../../../mocks/emiPlans/emiPlans.mock';
import { emiPlansResponseMock } from '../../../mocks/emiPlans/emiPlans.data';

test.describe('EMI - Accessibility', () => {
    test.beforeEach(async ({ page, emi }) => {
        await emiPlansMock(page, emiPlansResponseMock);
        await emi.goto(URL_MAP.emi);
    });

    test('should have no axe violations on the plan selection', async ({ emi }) => {
        expect(await emi.getA11yErrors()).toEqual([]);
    });

    test('should have no axe violations while a provider list is open', async ({ emi }) => {
        await emi.planSelection.openProviderList();

        expect(await emi.getA11yErrors()).toEqual([]);
    });

    test('should name each plan section after its own heading, with both selects inside the plan section', async ({ emi }) => {
        const { planSelection } = emi;

        await expect(emi.rootElement.getByRole('heading', { name: 'EMI plan' })).toBeVisible();
        await expect(planSelection.planGroup).toHaveAttribute('aria-describedby');
        await expect(planSelection.planGroup.getByRole('combobox', { name: 'Provider' })).toBeVisible();
        await expect(planSelection.planGroup.getByRole('combobox', { name: 'Plan' })).toBeVisible();
        await expect(planSelection.planSummaryGroup).toBeVisible();
    });

    test('should reach both selects by keyboard, in reading order', async ({ page, emi }) => {
        await page.keyboard.press('Tab');
        await expect(emi.planSelection.providerSelect).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(emi.planSelection.planSelect).toBeFocused();
    });
});
