import { test, expect } from '../../../../fixtures/dropin.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { EMI } from '../../../../models/emi';
import { emiPlansMock } from '../../../../mocks/emiPlans/emiPlans.mock';
import { emiPlansEmptyResponseMock, emiPlansResponseMock } from '../../../../../lib/src/components/EMI/stories/mocks';
import { EMI_PLANS } from '../../../utils/constants';

test.describe('Dropin - Advanced - EMI', () => {
    test('should display EMI tile with the plan selection inside it', async ({ dropin, page }) => {
        await emiPlansMock(page, emiPlansResponseMock);
        await dropin.goto(URL_MAP.dropinWithEmiPlans);

        const emiPaymentMethodHeader = dropin.getPaymentMethodHeader('EMI');
        await expect(emiPaymentMethodHeader.rootElement).toBeVisible();

        await dropin.selectNonStoredPaymentMethod('emi');

        const emi = new EMI(page);

        await expect(emi.planSelection.providerSelect).toContainText(EMI_PLANS.hdfc.name);
        await expect(emi.planSelection.planSelect).toContainText(EMI_PLANS.hdfc.firstPlan);
        await expect(emi.cardNumberField).toBeVisible();
    });

    // Paying the full amount on a tile that promises installments is worse than not offering it at all
    test('should not display the EMI tile when no plan is available', async ({ dropin, page }) => {
        await emiPlansMock(page, emiPlansEmptyResponseMock);
        await dropin.goto(URL_MAP.dropinWithEmiPlans);

        await expect(page.getByRole('radio', { name: 'Cards' })).toBeVisible();
        await expect(page.getByRole('radio', { name: 'EMI' })).toHaveCount(0);
    });
});
