import { test as base, expect } from '@playwright/test';
import { paymentDetailsMock } from '../../../mocks/paymentDetails/paymentDetails.mock';
import { paymentDetailsPartiallyAuthorisedAncvMockData } from '../../../mocks/paymentDetails/paymentDetails.data';
import { createOrderMock } from '../../../mocks/createOrder/createOrder.mock';
import { orderCreatedMockData } from '../../../mocks/createOrder/createOrder.data';
import { paymentsMock } from '../../../mocks/payments/payments.mock';
import { paymentsActionAncvMockData } from '../../../mocks/payments/payments.data';
import { statusMock } from '../../../mocks/status/status.mock';
import { statusMockData } from '../../../mocks/status/status.data';
import { setupMock } from '../../../mocks/setup/setup.mock';
import { setupMockData, setupWithAncvOrderMockData } from '../../../mocks/setup/setup.data';
import { ANCV } from '../../../models/ancv';
import { sessionsMock } from '../../../mocks/sessions/sessions.mock';
import { sessionsMockData } from '../../../mocks/sessions/sessions.data';
import { URL_MAP } from '../../../fixtures/URL_MAP';

type Fixture = {
    ancvPage: ANCV;
};

const test = base.extend<Fixture>({
    ancvPage: async ({ page }, use) => {
        const ancvPage = new ANCV(page);
        await sessionsMock(page, sessionsMockData);
        await setupMock(page, setupMockData);
        await ancvPage.goto(URL_MAP.ancv);
        await use(ancvPage);
    }
});

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

        await expect(ancvPage.paymentResult).toContainText('Partially Authorised');
    });
});
