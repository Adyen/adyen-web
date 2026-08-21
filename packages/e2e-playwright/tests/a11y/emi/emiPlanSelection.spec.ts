import { test as base, expect } from '../../../fixtures/base-fixture';
import { EMI } from '../../../models/emi';
import { URL_MAP } from '../../../fixtures/URL_MAP';
import { emiPlansMock } from '../../../mocks/emiPlans/emiPlans.mock';
import { emiPlansResponseMock } from '../../../../lib/src/components/EMI/stories/mocks';
import { EMI_PLANS } from '../../utils/constants';

type Fixture = {
    emiPage: EMI;
};

const test = base.extend<Fixture>({
    emiPage: async ({ page }, use) => {
        await use(new EMI(page));
    }
});

test.describe('EMI - Accessibility', () => {
    test.beforeEach(async ({ page, emiPage }) => {
        await emiPlansMock(page, emiPlansResponseMock);
        await emiPage.goto(URL_MAP.emi);
    });

    test('should have no axe violations on the plan selection', async ({ emiPage }) => {
        expect(await emiPage.getA11yErrors()).toEqual([]);
    });

    test('should have no axe violations while a provider list is open', async ({ emiPage }) => {
        await emiPage.planSelection.providerSelect.click();

        expect(await emiPage.getA11yErrors()).toEqual([]);
    });

    test('should name each plan section after its own heading', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'EMI plan' })).toBeVisible();
        await expect(page.getByRole('group', { name: 'EMI plan' })).toHaveAttribute('aria-describedby');
        await expect(page.getByRole('group', { name: 'Plan summary' })).toBeVisible();
    });

    test('should reach both selects and the card form by keyboard, in reading order', async ({ page, emiPage }) => {
        await page.keyboard.press('Tab');
        await expect(emiPage.planSelection.providerSelect).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(emiPage.planSelection.planSelect).toBeFocused();
    });

    test('should announce the discount of a plan the shopper picks', async ({ emiPage, page }) => {
        await emiPage.planSelection.selectProvider(EMI_PLANS.icici.name);

        await expect(page.getByRole('log')).toContainText(/discount offer applied for using ICICI Bank/i);
    });
});
