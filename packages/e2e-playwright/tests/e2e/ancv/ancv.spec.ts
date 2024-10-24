import { test, expect } from '../../../fixtures/ancv/ancv.fixture';
import { paymentDetailsMock } from '../../../mocks/paymentDetails/paymentDetails.mock';
import { paymentDetailsPartiallyAuthorisedAncvMockData } from '../../../mocks/paymentDetails/paymentDetails.data';
import { createOrderMock } from '../../../mocks/createOrder/createOrder.mock';
import { orderCreatedMockData } from '../../../mocks/createOrder/createOrder.data';
import { paymentsMock } from '../../../mocks/payments/payments.mock';
import { paymentsActionAncvMockData } from '../../../mocks/payments/payments.data';
import { statusMock } from '../../../mocks/status/status.mock';
import { statusMockData } from '../../../mocks/status/status.data';
import { setupMock } from '../../../mocks/setup/setup.mock';
import { setupWithAncvOrderMockData } from '../../../mocks/setup/setup.data';
//todo fix
test.describe('ANCV - Sessions', () => {
    test.fixme('should call onOrderUpdated when payment is partially authorised (Sessions flow)', async ({ page, ancvPage }) => {
        await createOrderMock(page, orderCreatedMockData);
        await paymentsMock(page, paymentsActionAncvMockData);
        await statusMock(page, statusMockData);
        await paymentDetailsMock(page, paymentDetailsPartiallyAuthorisedAncvMockData);
        await setupMock(page, setupWithAncvOrderMockData);
        await ancvPage.fillInID('ancv-id@example.com');
        await ancvPage.clickOnSubmit();

        expect(ancvPage.paymentResult).toContain('Partially Authorised');
    });
});
