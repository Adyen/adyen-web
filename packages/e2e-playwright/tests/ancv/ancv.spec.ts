import { test, expect } from '../../pages/ancv/ancv.fixture';
import { createOrderMock } from '../../mocks/createOrder/createOrder.mock';
import { orderCreatedMockData } from '../../mocks/createOrder/createOrder.data';
import { paymentsMock } from '../../mocks/payments/payments.mock';
import { paymentsActionAncvMockData, paymentsSuccessCardMockData } from '../../mocks/payments/payments.data';
import { paymentDetailsMock } from '../../mocks/paymentDetails/paymentDetails.mock';
import { paymentDetailsPartiallyAuthorisedAncvMockData } from '../../mocks/paymentDetails/paymentDetails.data';
import { setupWithAncvOrderMockData } from '../../mocks/setup/setup.data';
import { statusMockData } from '../../mocks/status/status.data';
import { setupMock } from '../../mocks/setup/setup.mock';
import { statusMock } from '../../mocks/status/status.mock';

// test('should display the await component on successful payment', async ({ ancvPage }) => {
//     const { ancv } = ancvPage;
//
//     await createOrderMock(ancv.page, orderCreatedMockData);
//     await paymentsMock(ancv.page, paymentsActionAncvMockData);
//
//     await ancv.fillInID('ancv-id@example.com');
//     await ancv.clickOnSubmit();
//
//     await expect(ancv.awaitText).toBeVisible();
// });

test('should display card component after handling onOrderCreated', async ({ ancvPage }) => {
    const { ancv } = ancvPage;

    await createOrderMock(ancv.page, orderCreatedMockData);
    await paymentsMock(ancv.page, paymentsActionAncvMockData);

    await ancv.fillInID('ancv-id@example.com');
    await ancv.clickOnSubmit();

    await paymentDetailsMock(ancv.page, paymentDetailsPartiallyAuthorisedAncvMockData);
    await setupMock(ancv.page, setupWithAncvOrderMockData);

    await statusMock(ancv.page, statusMockData);

    await paymentsMock(ancv.page, paymentsSuccessCardMockData);

    const cardDisclaimerText = ancv.page.getByText('All fields are required unless marked otherwise.');

    await expect(cardDisclaimerText).toBeVisible();
});
