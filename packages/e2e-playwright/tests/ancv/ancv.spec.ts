import { test, expect } from '../../pages/ancv/ancv.fixture';
import { createOrderMock } from '../../mocks/createOrder/createOrder.mock';
import { orderCreatedMockData } from '../../mocks/createOrder/createOrder.data';
import { paymentsMock } from '../../mocks/payments/payments.mock';
import { paymentsActionAncvMockData } from '../../mocks/payments/payments.data';
import { paymentDetailsMock } from '../../mocks/paymentDetails/paymentDetails.mock';
import { paymentDetailsPartiallyAuthorisedAncvMockData } from '../../mocks/paymentDetails/paymentDetails.data';
import { setupWithAncvOrderMockData } from '../../mocks/setup/setup.data';
import { statusMockData } from '../../mocks/status/status.data';
import { setupMock } from '../../mocks/setup/setup.mock';
import { statusMock } from '../../mocks/status/status.mock';

test.describe('ANCV - Sessions', () => {
    test('should call onOrderCreated when payment is partially authorised (Sessions flow)', async ({ ancvPage }) => {
        const { ancv, page } = ancvPage;

        await createOrderMock(page, orderCreatedMockData);
        await paymentsMock(page, paymentsActionAncvMockData);
        await statusMock(page, statusMockData);
        await paymentDetailsMock(page, paymentDetailsPartiallyAuthorisedAncvMockData);
        await setupMock(page, setupWithAncvOrderMockData);

        await ancv.fillInID('ancv-id@example.com');
        await ancv.clickOnSubmit();

        await expect(page.locator('#result-message')).toHaveText('Partially Authorised');
    });
});
